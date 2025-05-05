import { ReqMaterialParserService } from './req-material-parser.service';
import { DefaultParserService } from './default-parser.service';
import { IHtmlParser, PARSER_MAP_TOKEN } from './ihtml-parser.interface';
import { ReqManutencaoParserService } from './req-manutencao-parser.service';
import { ListaManutencaoParserService } from './lista-manutencao-parser.service';
import { ListaMaterialParserService } from './lista-material-parser.service';

const configParserProvider = {
  provide: PARSER_MAP_TOKEN,
  useFactory: (
    defaultParser: DefaultParserService,
    reqMaterialParser: ReqMaterialParserService,
    reqManutencaoParserService: ReqManutencaoParserService,
    listaManutencaoParserService: ListaManutencaoParserService,
    listaMaterialParserService: ListaMaterialParserService,
  ): Map<string, IHtmlParser> => {
    const parserMap = new Map<string, IHtmlParser>();
    parserMap.set('default', defaultParser);
    parserMap.set('req-material', reqMaterialParser);
    parserMap.set('req-manutencao', reqManutencaoParserService);
    parserMap.set('lista-manutencao', listaManutencaoParserService);
    parserMap.set('lista-material', listaMaterialParserService);
    // Adicione outros parsers ao mapa
    // parserMap.set('outro-parser-key', outroParserService);
    return parserMap;
  },
  inject: [
    DefaultParserService,
    ReqMaterialParserService,
    ReqManutencaoParserService,
    ListaManutencaoParserService,
    ListaMaterialParserService,
  ],
};

export default configParserProvider;
