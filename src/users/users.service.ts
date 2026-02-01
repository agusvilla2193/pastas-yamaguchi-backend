import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; // Para generar el token de confirmación
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOneByEmail(createUserDto.email);

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // Generamos un token aleatorio para la confirmación de email
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      confirmationToken,
      isActive: false, // El usuario empieza inactivo hasta confirmar mail
    });

    return this.usersRepository.save(newUser);
  }

  // Método nuevo para activar al usuario cuando haga clic en el mail
  async confirmEmail(token: string): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ confirmationToken: token });

    if (!user) {
      throw new BadRequestException('Token de confirmación inválido.');
    }

    user.isActive = true;
    user.confirmationToken = null; // Limpiamos el token una vez usado
    await this.usersRepository.save(user);
    return true;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    let dataToUpdate = { ...updateUserDto };

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
      dataToUpdate = { ...dataToUpdate, password: hashedPassword };
    }

    const updatedUser = this.usersRepository.merge(user, dataToUpdate);
    return this.usersRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
