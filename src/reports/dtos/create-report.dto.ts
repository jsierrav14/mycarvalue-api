import { IsNumber, IsString, Min, Max, IsLatitude, isLatitude, IsLongitude} from "class-validator";

export class CreateReportDto {
    @IsString()
    make:string;
    
    @IsString()
    model: string;

    @IsNumber()
    @Min(1930)
    @Max(2023)
    year: number;
    
    @IsNumber()
    @Min(0)
    @Max(10000000)
    mileage: number;

    @IsLongitude()
    lng: number;
    
    @IsLatitude()
    lat:number;

    @IsNumber()
    @Min(0)
    price:number;
}