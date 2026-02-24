import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
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
    if (existingUser) throw new ConflictException('El email ya está registrado.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      confirmationToken,
      isActive: false,
    });

    return this.usersRepository.save(newUser);
  }

  async confirmEmail(token: string): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ confirmationToken: token });
    if (!user) throw new BadRequestException('Token de confirmación inválido o expirado.');

    user.isActive = true;
    user.confirmationToken = null;
    await this.usersRepository.save(user);
    return true;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    // Aquí no usamos select para que el AuthService pueda validar el password al hacer login
    return this.usersRepository.findOneBy({ email });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      // Excluimos password de forma preventiva para métodos que no lo requieran
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'phone', 'address', 'city', 'zipCode']
    });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Buscamos sin el select restrictivo para poder mergear correctamente
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);

    const dataToUpdate = { ...updateUserDto };

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updatedUser = this.usersRepository.merge(user, dataToUpdate);
    return this.usersRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.usersRepository.remove(user);
  }

  // Métodos de token de reset se mantienen por brevedad y están correctos
  async updateResetToken(id: number, token: string, expires: Date): Promise<void> {
    await this.usersRepository.update(id, { resetPasswordToken: token, resetPasswordExpires: expires });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ resetPasswordToken: token });
  }

  async clearResetToken(id: number): Promise<void> {
    await this.usersRepository.update(id, { resetPasswordToken: null, resetPasswordExpires: null });
  }
}
