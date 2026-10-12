import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Load } from './load.entity';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:'integer'})
  user_id: number;

  @ManyToOne(() => User, user => user.likes, {onDelete: 'RESTRICT'})
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({type:'integer'})
  load_id: number;

  @ManyToOne(() => Load, load => load.likes, {onDelete: 'RESTRICT'})
  @JoinColumn({ name: 'load_id' })
  load: Load;
}