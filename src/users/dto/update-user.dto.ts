import { PartialType } from '@nestjs/swagger'; // Cambiado para que Swagger funcione
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) { }
