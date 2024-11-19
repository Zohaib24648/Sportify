import { IsDateString, IsNotEmpty } from "class-validator"




export class SlotDto {

@IsNotEmpty()
court_id : string;

@IsDateString()
@IsNotEmpty()
start_time : Date;

@IsNotEmpty()
@IsDateString()
end_time : Date;


}