import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ClientAppConfig } from 'src/client-app-config/client-app-config.model';
  import { InjectModel } from '@nestjs/sequelize';
  
  @Injectable()
  export class AppEnabledGuard implements CanActivate {
    constructor(
      private readonly reflector: Reflector,
      @InjectModel(ClientAppConfig) private readonly clientAppModel: typeof ClientAppConfig,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const config = await this.clientAppModel.findByPk(1);
  
      if (config?.disabled) {
        throw new ForbiddenException('Приложение временно недоступно для приёма заказов');
      }
  
      return true;
    }
  }
  