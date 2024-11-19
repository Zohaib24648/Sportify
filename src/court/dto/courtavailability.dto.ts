import { IsDate } from "class-validator"


export class CourtAvailabilityDto{
    
    @IsDate()
    start_time : Date
    
    @IsDate()
    end_time :  Date

    
}