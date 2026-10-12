import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Load } from './load.entity';
import { Like } from './like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, name: 'password' })
  password: string;

  @OneToMany(() => Load, load => load.creator)
  loads: Load[];

  @OneToMany(() => Like, like => like.user)
  likes: Like[];
}