import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuItemDto } from './create-menuItem.dto';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}
