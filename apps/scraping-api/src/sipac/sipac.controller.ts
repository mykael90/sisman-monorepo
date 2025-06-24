// src/sipac/sipac.controller.ts
import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Logger,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  NotFoundException,
  Req,
  Res,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { SipacService } from './sipac.service';
import { ImageParserService } from './html-parser/image-parser.service';
import { IsNotEmpty, IsUrl, IsOptional, IsString, IsIn } from 'class-validator';
import { sipacPathMappings } from './sipac-paths.map';
import { GetFileService } from './get-file.service';

// DTO for fetching a SIPAC page with a specified URL, method, and optional body.
export class FetchSipacPageDto {
  @IsNotEmpty()
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  targetUrl: string;
  targetReferer?: string;

  @IsOptional() // Método é opcional, default será GET
  @IsIn(['GET', 'POST']) // Aceitar apenas GET ou POST
  targetMethod?: 'GET' | 'POST'; // HTTP method (GET or POST).

  @IsOptional()
  @IsString()
  targetBody?: string; // Request body (only relevant for POST).
}

// DTO for requests where the path determines the target URL
export class SipacPathRequestDto {
  @IsOptional()
  @IsIn(['GET', 'POST'])
  targetMethod?: 'GET' | 'POST'; // Client still specifies the method

  @IsOptional()
  @IsString()
  targetBody?: string; // Client provides body if it's a POST
}

@Controller('sipac')
export class SipacController {
  private readonly logger = new Logger(SipacController.name);

  constructor(
    private readonly sipacService: SipacService,
    private readonly imageParserService: ImageParserService,
    private readonly getFileService: GetFileService,
  ) {}

  // Endpoint to fetch a SIPAC page using a specified URL, method, and optional body.
  @Post('fetch')
  @HttpCode(HttpStatus.OK)
  async fetchPage(
    @Body(new ValidationPipe()) body: FetchSipacPageDto,
  ): Promise<any> {
    this.logger.debug(
      `Received request: ${body.targetMethod || 'GET'} ${body.targetUrl}`,
    );
    try {
      // Passa o DTO inteiro para o serviço
      const result = await this.sipacService.fetchAndParse(body, 'default');
      return result;
    } catch (error) {
      this.logger.error(
        `Error processing ${body.targetMethod || 'GET'} ${body.targetUrl}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Endpoint to fetch a SIPAC page using query parameters (only for GET).
  @Get('fetch-query')
  async fetchPageQuery(
    @Query(new ValidationPipe()) query: FetchSipacPageDto,
  ): Promise<any> {
    this.logger.debug(`Received GET request to fetch URL: ${query.targetUrl}`);
    // Forçar GET aqui, ignorando targetMethod/targetBody do query param se houver
    query.targetMethod = 'GET';
    query.targetBody = undefined;
    try {
      const result = await this.sipacService.fetchAndParse(query, 'default');
      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching ${query.targetUrl}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Endpoint to manually trigger re-authentication.
  @Post('reauthenticate')
  @HttpCode(HttpStatus.OK)
  async reauthenticate(): Promise<{ message: string; cookies?: string[] }> {
    this.logger.log(
      'Manual re-authentication trigger received. Invalidating cache...',
    );
    try {
      await this.sipacService.invalidateAuth();
      this.logger.log('Cache invalidated. Performing full authentication...');
      const cookies = await this.sipacService.getAuthCookies();
      this.logger.log('Manual re-authentication successful.');
      return { message: 'Re-authentication successful.', cookies: cookies };
    } catch (error) {
      this.logger.error(
        `Manual re-authentication failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Endpoint para buscar um arquivo de produção do SIGAA (ex: imagem, PDF).
   * Ele abstrai a construção da URL, exigindo apenas os parâmetros chave.
   * @param res - O objeto de resposta do Express para streaming do arquivo.
   * @param idProducao - O ID da produção a ser buscada.
   * @param key - A chave de acesso para a produção.
   */
  @Get('image')
  async getImage(
    @Res() res: Response,
    @Query('idProducao') idProducao: string,
    @Query('key') key: string,
  ) {
    this.logger.log(
      `Received request to fetch image for idProducao: ${idProducao}`,
    );

    // 1. Validação dos parâmetros de entrada
    if (!idProducao || !key) {
      throw new BadRequestException(
        'Both "idProducao" and "key" query parameters are required.',
      );
    }

    // 2. Construção da URL final de forma segura dentro do backend
    const baseUrl = 'https://sigaa.ufrn.br/sigaa/verProducao';
    const fullUrl = `${baseUrl}?idProducao=${idProducao}&key=${key}`;
    this.logger.log(`Assembled final URL: ${fullUrl}`);

    try {
      // 3. Chama o serviço com a URL completa e correta
      const blob = await this.getFileService.getArquivoDeProducao(fullUrl);

      // 4. Envia o arquivo de volta para o cliente
      res.setHeader('Content-Type', blob.type);
      res.setHeader('Content-Length', blob.size.toString());
      // Você pode tentar criar um nome de arquivo mais dinâmico se quiser
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="producao_${idProducao}"`,
      );

      const buffer = Buffer.from(await blob.arrayBuffer());
      res.send(buffer);
    } catch (error) {
      this.logger.error(
        `Error processing image request for idProducao ${idProducao}: ${error.message}`,
        error.stack,
      );

      // Re-lança o erro para que o Exception Filter do NestJS o capture e formate a resposta de erro
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to retrieve the file: ${error.message}`,
      );
    }
  }

  // Endpoint to handle requests based on predefined path mappings.
  @Get('lista/:path/*')
  // @HttpCode(HttpStatus.OK) // OK is default for GET, so this is optional
  async handleListaPathRequestGet(
    @Req() req: Request,
    // Renamed slightly for clarity, but you can keep the old name
    @Param('path') path: string,
    // Inject all query parameters as an object
    @Query() queryParams: Record<string, any>,
  ): Promise<any> {
    this.logger.debug(`Lista Path: ${path}`);
    this.logger.debug(`Query Parameters: ${JSON.stringify(queryParams)}`);
    this.logger.debug(`Full Request URL: ${JSON.stringify(req.url)}`);

    // Get the full path including query string
    const fullPath = req.url.startsWith('/sipac/')
      ? req.url.substring('/sipac/'.length)
      : req.url;

    // 2. Find the index of the query string separator '?'
    const queryIndex = fullPath.indexOf('?');

    // 3. Extract only the part before the '?' if it exists
    const pathKey =
      queryIndex === -1
        ? fullPath // No query string found, use the whole path
        : fullPath.substring(0, queryIndex); // Extract the part before '?'

    this.logger.debug(`Extracted Path Key: ${pathKey}`);

    const target = sipacPathMappings[pathKey];

    // Handle case where the path is not found
    if (!target) {
      this.logger.warn(`Received request for unmapped path: ${pathKey}`);
      throw new NotFoundException(
        `The requested path '${pathKey}' is not configured or supported.`,
      );
    }

    //também verificar se existe target.queryParams se target.method for POST, caso contrátio lançar erro
    if (target.method === 'POST' && !target.queryParams) {
      this.logger.warn(
        `Path '${pathKey}' is configured for POST but has no query parameters defined.`,
      );
      throw new NotFoundException(
        `Path '${pathKey}' is configured for POST but has no query parameters defined.`,
      );
    }

    // Construct the targetBody string from query parameters if it is a POST
    let targetBodyString: string | undefined = undefined;
    const searchParams = new URLSearchParams();
    for (const key in queryParams) {
      // Ensure the property belongs to the object itself
      if (Object.prototype.hasOwnProperty.call(queryParams, key)) {
        // URLSearchParams handles encoding automatically
        searchParams.append(key, String(queryParams[key]));
      }
    }

    // Check if searchParams has all the items defined in target.queryParams
    if (target.queryParams) {
      const missingParams = target.queryParams.filter(
        (param) => !queryParams[param],
      );
      if (missingParams.length > 0) {
        this.logger.warn(
          `Missing required query parameters for path '${pathKey}': ${missingParams.join(
            ', ',
          )}`,
        );
        throw new NotFoundException(
          `Missing required query parameters: ${missingParams.join(', ')}`,
        );
      }
    }

    // Only set targetBodyString if there were actually query parameters
    if (searchParams.toString()) {
      targetBodyString = searchParams.toString();
    }

    const serviceDtoForGet: FetchSipacPageDto = {
      targetUrl: target.url, // Use URL with appended params
      targetMethod: target.method,
      targetBody: targetBodyString, // Body is not typically used for GET in HTTP standard
    };

    // Use the DTO for standard GET behavior
    const effectiveMethod = 'GET';
    this.logger.log(
      `Handling mapped pathKey '${pathKey}': ${effectiveMethod} ${serviceDtoForGet.targetUrl}`,
    );
    if (targetBodyString) {
      this.logger.debug(`Derived query parameters: ${targetBodyString}`);
    }

    try {
      // 5. Call the service with the constructed DTO (using the standard GET approach)
      const result = await this.sipacService.fetchAndParseList(
        serviceDtoForGet,
        target.parser,
      );
      return result; // Return the parsed result
    } catch (error) {
      // Log the error with context and re-throw (same as before)
      this.logger.error(
        `Error processing mapped pathKey '${pathKey}' (${effectiveMethod} ${serviceDtoForGet.targetUrl}): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Endpoint to handle requests based on predefined path mappings.
  @Get(':path/*')
  // @HttpCode(HttpStatus.OK) // OK is default for GET, so this is optional
  async handlePathRequestGet(
    @Req() req: Request,
    // Renamed slightly for clarity, but you can keep the old name
    @Param('path') path: string,
    // Inject all query parameters as an object
    @Query() queryParams: Record<string, any>,
  ): Promise<any> {
    this.logger.debug(`Path: ${path}`);
    this.logger.debug(`Query Parameters: ${JSON.stringify(queryParams)}`);
    this.logger.debug(`Full Request URL: ${JSON.stringify(req.url)}`);

    // Get the full path including query string
    const fullPath = req.url.startsWith('/sipac/')
      ? req.url.substring('/sipac/'.length)
      : req.url;

    // 2. Find the index of the query string separator '?'
    const queryIndex = fullPath.indexOf('?');

    // 3. Extract only the part before the '?' if it exists
    const pathKey =
      queryIndex === -1
        ? fullPath // No query string found, use the whole path
        : fullPath.substring(0, queryIndex); // Extract the part before '?'

    this.logger.debug(`Extracted Path Key: ${pathKey}`);

    const target = sipacPathMappings[pathKey];

    // Handle case where the path is not found
    if (!target) {
      this.logger.warn(`Received request for unmapped path: ${pathKey}`);
      throw new NotFoundException(
        `The requested path '${pathKey}' is not configured or supported.`,
      );
    }

    //também verificar se existe target.queryParams se target.method for POST, caso contrátio lançar erro
    if (target.method === 'POST' && !target.queryParams) {
      this.logger.warn(
        `Path '${pathKey}' is configured for POST but has no query parameters defined.`,
      );
      throw new NotFoundException(
        `Path '${pathKey}' is configured for POST but has no query parameters defined.`,
      );
    }

    // Construct the targetBody string from query parameters if it is a POST
    let targetBodyString: string | undefined = undefined;
    const searchParams = new URLSearchParams();
    for (const key in queryParams) {
      // Ensure the property belongs to the object itself
      if (Object.prototype.hasOwnProperty.call(queryParams, key)) {
        // URLSearchParams handles encoding automatically
        searchParams.append(key, String(queryParams[key]));
      }
    }

    // Check if searchParams has all the items defined in target.queryParams
    if (target.queryParams) {
      const missingParams = target.queryParams.filter(
        (param) => !queryParams[param],
      );
      if (missingParams.length > 0) {
        this.logger.warn(
          `Missing required query parameters for path '${pathKey}': ${missingParams.join(
            ', ',
          )}`,
        );
        throw new NotFoundException(
          `Missing required query parameters: ${missingParams.join(', ')}`,
        );
      }
    }

    // Only set targetBodyString if there were actually query parameters
    if (searchParams.toString()) {
      targetBodyString = searchParams.toString();
    }

    const serviceDtoForGet: FetchSipacPageDto = {
      targetUrl: target.url, // Use URL with appended params
      targetMethod: target.method,
      targetBody: targetBodyString, // Body is not typically used for GET in HTTP standard
    };

    // Use the DTO for standard GET behavior
    const effectiveMethod = 'GET';
    this.logger.log(
      `Handling mapped pathKey '${pathKey}': ${effectiveMethod} ${serviceDtoForGet.targetUrl}`,
    );
    if (targetBodyString) {
      this.logger.debug(`Derived query parameters: ${targetBodyString}`);
    }

    try {
      // 5. Call the service with the constructed DTO (using the standard GET approach)
      const result = await this.sipacService.fetchAndParse(
        serviceDtoForGet,
        target.parser,
      );
      return result; // Return the parsed result
    } catch (error) {
      // Log the error with context and re-throw (same as before)
      this.logger.error(
        `Error processing mapped pathKey '${pathKey}' (${effectiveMethod} ${serviceDtoForGet.targetUrl}): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
