import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsString } from "class-validator"

export class SlotCourtDto{


    @ApiProperty({
        description: 'The ID of the court',
        type: String,
        example: 'court123',
      })
    @IsString()
    court_id: string
    

    @ApiProperty({
        description: 'The date for which to retrieve available slots',
        type: String,
        format: 'date',
        example: '2024-11-27',
      })
    @IsDate()
    @Type(() => Date)
    date: Date
}