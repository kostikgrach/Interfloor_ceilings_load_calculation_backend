import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Like } from './like.entity';
import { User } from './user.entity';

export enum ServiceStatus {
  Draft = 'draft',
  Published = 'active',
  Deleted = 'deleted',
}

@Entity('loads')
export class Load {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({type: 'varchar', length: 50})
  title: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  description: string | null;

  @Column({type: 'integer', nullable: true})
  standard_load: number | null;

  @Column({type: 'numeric', precision: 2,  scale: 1, nullable: true})
  reliability_coefficient: string | null;

  @Column({type: 'varchar', length: 50})
  image: string | null;

  @Column({type: 'varchar', length: 50})
  video: string | null;

  @Column({type: 'varchar', length: 8, default: ServiceStatus.Draft})
  status: ServiceStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'creation_date' })
  creation_date: Date;

  @Column({ type: 'timestamp', name: 'formation_date', nullable: true})
  formation_date: Date | null; 

  @Column({type:'integer'})
  creator_id: number;

  @ManyToOne(() => User, user => user.loads, {onDelete: 'RESTRICT'})
  @JoinColumn({name: 'creator_id'})
  creator: User;

  @OneToMany(() => Like, like => like.load)
  likes: Like[];
}


