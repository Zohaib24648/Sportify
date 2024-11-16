//auth/dto/court.dto.ts
export class CourtDto {

    name: string;
    description: string;
    court_location: string;
    hourly_rate: number;
    min_down_payment: number;
    created_at: Date;
    updated_at: Date;
    // court_specs: Court_Specs[];
    // court_availability: Court_Availability[];
    // court_media: Court_Media[];
    // slots: Slot[];
    // reviews: Review[];
    // game_types: Court_Game_Type[];

}


// model Court {
//     id String @id @default(uuid())
//     name String 
//     description String
//     court_location  String
//     hourly_rate Int
//     min_down_payment Decimal
//     created_at DateTime @default(now())
//     updated_at DateTime @updatedAt
//     court_specs Court_Specs[]
//     court_availability Court_Availability[]
//     court_media Court_Media[]
//     slots Slot[]
//     reviews Review[]
//     game_types Court_Game_Type[]
//     }