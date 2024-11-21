import { Type } from "class-transformer"
import { ArrayContains, ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDate } from "class-validator"


export class CourtAvailabilityDto{
    
    @IsDate()
    @Type(() => Date)
    start_time : Date
    
    @Type(() => Date)
    @IsDate()
    end_time :  Date

    @IsArray()
    @IsBoolean({each : true})
    @ArrayMaxSize(7)
    @ArrayMinSize(7)
    Day_of_week : boolean[]

    //  Day_of_week Boolean[] @default([true, true, true, true, true, true, true])
}