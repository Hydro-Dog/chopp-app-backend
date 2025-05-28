import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from 'src/categories/category.model';
import { Op } from 'sequelize';
import { FileModel } from 'src/files/file.model';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiResponse, PRODUCT_STATE } from 'src/shared/enums';
import { ProductFile } from './product-file.model';
import { ClientAppConfigService } from 'src/client-app-config/client-app-config.service';

@Injectable()
export class ProductService implements OnModuleInit {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product) private readonly productRepository: typeof Product,
    @InjectModel(ProductFile) private readonly productFileRepository: typeof ProductFile,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'development') return;

    const deliveryProduct = await this.productRepository.findByPk(process.env.DELIVERY_PRODUCT_ID);
    if (!deliveryProduct) {
      await this.productRepository.create({
        id: process.env.DELIVERY_PRODUCT_ID,
        title: 'Доставка',
        description: 'Услуга доставки заказа',
        price: 0,
        state: PRODUCT_STATE.HIDDEN,
      });
    }

    this.logger.log('🚀 Создан продукт ДОСТАВКА стоимостью 0 руб');
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { title: dto.title },
    });

    if (existingProduct) {
      throw new HttpException('Product with this title already exists', HttpStatus.BAD_REQUEST);
    }

    const product = await this.productRepository.create({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      categoryId: dto.categoryId,
      imagesOrder: dto.imageIds,
      state: dto.state,
    });

    if (dto.imageIds?.length) {
      await product.$set('images', dto.imageIds);
    }

    return this.getProductById(product.id);
  }

  async updateProduct(dto: UpdateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findByPk(dto.id);

    if (!existingProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    await existingProduct.update({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      categoryId: dto.categoryId,
      imagesOrder: dto.imageIds,
      state: dto.state,
    });

    if (dto.imageIds?.length) {
      await existingProduct.$set('images', dto.imageIds);
    }

    return this.getProductById(existingProduct.id);
  }

  async getProductById(productId: string): Promise<Product> {
    return this.productRepository.findByPk(productId, {
      include: [
        {
          model: FileModel,
          as: 'images',
          through: { attributes: [] },
        },
        Category,
      ],
      attributes: { exclude: ['categoryId'] },
    });
  }

  async findAllProducts(
    pageNumber = 1,
    limit = 10,
    categoryId?: number,
    search?: string,
    sort: string = 'id',
    order: string = 'ASC',
    state?: PRODUCT_STATE[],
  ) {
    const offset = (pageNumber - 1) * limit;

    const whereCondition: any = {
      id: { [Op.ne]: process.env.DELIVERY_PRODUCT_ID }, // ⛔️ Исключаем товар "Доставка"
    };

    if (categoryId) whereCondition.categoryId = categoryId;

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (state && state.length > 0) {
      whereCondition.state = { [Op.in]: state };
    }

    const validSortColumns = ['id', 'title', 'price', 'createdAt', 'updatedAt'];
    if (!validSortColumns.includes(sort)) sort = 'id';
    order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { rows: items, count: totalItems } = await this.productRepository.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [[sort, order]],
      distinct: true,
      include: [{ model: FileModel, as: 'images' }, { model: Category }],
      attributes: { exclude: ['categoryId'] },
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      pageNumber,
      limit,
    };
  }

  async findProductById(id: number) {
    return this.productRepository.findOne({
      where: { id },
      include: [{ model: FileModel, as: 'images' }, { model: Category }],
      attributes: { exclude: ['categoryId'] },
    });
  }

  async updateProductState(productId: string, state: PRODUCT_STATE): Promise<Product> {
    const product = await this.productRepository.findByPk(productId);

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    await product.update({ state });
    return this.getProductById(productId);
  }

  async deleteProduct(productId: number): Promise<ApiResponse> {
    const product = await this.productRepository.findByPk(productId);

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    await this.productFileRepository.destroy({ where: { productId } });
    await this.productRepository.destroy({ where: { id: productId } });

    return { status: HttpStatus.OK, message: 'ok' };
  }
}
