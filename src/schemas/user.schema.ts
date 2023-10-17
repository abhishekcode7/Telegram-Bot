import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// export type CatDocument = HydratedDocument<Cat>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  id: string;

  @Prop()
  city: string;
}

export const UserSchema = SchemaFactory.createForClass(User);