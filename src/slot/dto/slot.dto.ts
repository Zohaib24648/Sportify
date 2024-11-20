import { Type } from "class-transformer";
import { IsDate, IsDateString, IsNotEmpty } from "class-validator"




export class SlotDto {

@IsNotEmpty()
court_id : string;

@IsDate()
@Type(() => Date)
start_time : Date;

@IsDate()
@Type(() => Date)
end_time : Date;


}