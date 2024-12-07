import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameDto } from './dto/game.dto';
import { AddGameCourtDto } from './dto/addgamecourt.dto';
import { CourtService } from 'src/court/court.service';
import { UpdateGameCourtDto } from './dto/updategamecourt.dto';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courtService: CourtService,
  ) {}

  async create_game(dto: GameDto) {
    try {
      const game = await this.prisma.game.create({
        data: { ...dto },
      });
      return game;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create game',
        error.message,
      );
    }
  }

  async get_games() {
    try {
      const games = await this.prisma.game.findMany();
      return games;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve games',
        error.message,
      );
    }
  }

  async get_game(id: string) {
    try {
      const games = await this.prisma.game.findFirst({
        where: {
          id: id,
        },
      });

      if (!games) {
        throw new NotFoundException(`Game with ID ${id} not found`);
      }

      const total_bookings_for_game = await this.prisma.booking.count({
        where: {
          slot : {
            court: {
             game_links: {
                some: {
                  game_id: id,
                },
            }
          }
        },
    }});

      return { games, total_bookings_for_game };
    } catch (error) {
      throw new NotFoundException('Game not found', error.message);
    }
  }

  async delete_game(id: string) {
    try {
       return await this.prisma.$transaction(async (prisma) => {
      const deleted_associations=   await this.prisma.courtGameLink.deleteMany({
          where: { game_id: id },
        });
        const deleted_game = await this.prisma.game.delete({ where: { id } });
      
        //return the game and number of deleted assiciations

        return {game:deleted_game, associations:deleted_associations};
      
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Game with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        'Failed to delete game',
        error.message,
      );
    }
  }

  async update_game(id: string, dto: GameDto) {
    console.log('BODY', dto);
    try {
      return await this.prisma.game.update({
        where: { id },
        data: { ...dto },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update game',
        error.message,
      );
    }
  }

  // async addGamesToCourt(dto: AddGameCourtDto) {
  //   const { court_id, game_type_ids } = dto;
  
  //   try {
  //     // Verify that the court exists
  //     const court = await this.prisma.court.findFirst({
  //       where: { id: court_id },
  //     });
  //     if (!court) {
  //       throw new NotFoundException(`Court with ID ${court_id} not found`);
  //     }
  
  //     // If no game IDs are provided, delete all existing game links
  //     if (game_type_ids.length === 0) {
  //       const deletedGames = await this.prisma.court_Game_Type.deleteMany({
  //         where: { court_id },
  //       });
  //       return { message: 'All game links for the court have been deleted', deletedGames };
  //     }
  
  //     // Verify that all game IDs exist
  //     for (const game_type_id of game_type_ids) {
  //       const game = await this.get_game(game_type_id);
  //       if (!game) {
  //         throw new NotFoundException(`Game with ID ${game_type_id} not found`);
  //       }
  //     }
  
  //     // Prepare data for createMany
  //     const data = game_type_ids.map((game_type_id) => ({
  //       court_id,
  //       game_type_id,
  //     }));
  
  //     // Use a transaction to delete existing links and add new ones
  //     const result = await this.prisma.$transaction(async (prisma) => {
  //       // Delete existing game links
  //       // find //unique
  //       const deletedGames = await prisma.court_Game_Type.deleteMany({
  //         where: { court_id },
  //       });
  
  //       // Create new game links
  //       let addedGames;
  //       if (data.length > 1) {
  //         // Use createMany if there are multiple entries
  //         addedGames = await prisma.court_Game_Type.createMany({
  //           data,
  //           skipDuplicates: true, // Optional: skips duplicates if any
  //         });
  //       } else {
  //         // Use create if there is only one entry
  //         addedGames = await prisma.court_Game_Type.create({
  //           data: data[0],
  //         });
  //       }
  
  //       return { deletedGames, addedGames };
  //     });
  
  //     return result;
  //   } catch (error) {
  //     if (
  //       error instanceof Prisma.PrismaClientKnownRequestError &&
  //       error.code === 'P2002'
  //     ) {
  //       throw new ConflictException(`One or more games are already linked to this court.`);
  //     }
  
  //     throw new InternalServerErrorException(
  //       'Failed to add games to court',
  //       error.message,
  //     );
  //   }
  // }


  
// src/game/game.service.ts

async updateCourtGames(dto: AddGameCourtDto) {
  const { court_id, game_ids } = dto;

  // Step 1: Validate Court Existence
  const court = await this.prisma.court.findUnique({
    where: { id: court_id },
  });
  if (!court) {
    throw new NotFoundException(`Court with ID ${court_id} not found`);
  }

  // Step 2: Validate Game IDs
  const validGames = await this.prisma.game.findMany({
    where: { id: { in: game_ids } },
    select: { id: true },
  });
  const validGameIds = validGames.map((game) => game.id);
  const invalidGameIds = game_ids.filter((id) => !validGameIds.includes(id));
  if (invalidGameIds.length > 0) {
    throw new NotFoundException(
      `Games with IDs ${invalidGameIds.join(', ')} not found`,
    );
  }

  // Step 3: Fetch Current Associations
  const currentAssociations = await this.prisma.courtGameLink.findMany({
    where: { court_id },
    select: { game_id: true },
  });


  const currentGameIds = currentAssociations.map((link) => link.game_id);

  // Step 4: Determine Changes
  const gamesToAdd = game_ids.filter((id) => !currentGameIds.includes(id));
  const gamesToRemove = currentGameIds.filter((id) => !game_ids.includes(id));

  // Step 5: Update Associations
  await this.prisma.$transaction(async (prisma) => {
    // Remove associations
    if (gamesToRemove.length > 0) {
      await prisma.courtGameLink.deleteMany({
        where: {
          court_id,
          game_id: { in: gamesToRemove },
        },
      });
    }

    // Add new associations
    if (gamesToAdd.length > 0) {
      const newLinks = gamesToAdd.map((game_id) => ({
        court_id,
        game_id,
      }));
      await prisma.courtGameLink.createMany({
        data: newLinks,
        skipDuplicates: true,
      });
    }
  });

  return { message: 'Court games updated successfully' };
}


  async get_court_games(id: string) {
    try {
      const court_games = await this.prisma.courtGameLink.findMany({
        where: {
          court_id: id,
        },
        include: {
          game: true,
        },
      });
      return court_games;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve court games',
        error.message,
      );
    }
  }
}
