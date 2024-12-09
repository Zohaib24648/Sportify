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
