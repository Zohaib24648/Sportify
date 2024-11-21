import { Type } from "class-transformer";
import { IsDate } from "class-validator";

export class TimeDto {
    @IsDate()
    @Type(() => Date)
    start_time : Date;
    
    @IsDate()
    @Type(() => Date)
    end_time : Date;
}