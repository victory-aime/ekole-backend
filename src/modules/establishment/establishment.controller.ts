import { Controller, Get } from '@nestjs/common';
import { EstablishmentService } from './establishment.service';
import { API_URL } from '../../config/api';
import { BASE_APIS_URL } from '../../config/enum';

@Controller(BASE_APIS_URL.SECURED)
export class EstablishmentController {
  constructor(private readonly establishmentService: EstablishmentService) {}

  @Get(API_URL.ESTABLISHMENT.GET_ALL)
  async getAllEstablishments() {
    return this.establishmentService.getEstablishment();
  }
}
