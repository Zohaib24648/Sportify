import { Type } from "class-transformer"
import { IsDate, IsString } from "class-validator"

export class SlotCourtDto{


    @IsString()
    court_id: string
    
    @IsDate()
    @Type(() => Date)
    date: Date
}