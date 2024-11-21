import { Type } from "class-transformer";
import { IsDate, IsDateString, IsNotEmpty } from "class-validator"
import { TimeDto } from "./time.dto";




export class SlotDto  extends TimeDto{

@IsNotEmpty()
court_id : string;
}