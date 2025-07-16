// Coordenadas aproximadas de cidades brasileiras principais
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'campo grande': { lat: -20.4628, lng: -54.6178 },
  'são paulo': { lat: -23.5505, lng: -46.6333 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  'belo horizonte': { lat: -19.9191, lng: -43.9386 },
  'brasília': { lat: -15.8267, lng: -47.9218 },
  'salvador': { lat: -12.9714, lng: -38.5014 },
  'fortaleza': { lat: -3.7319, lng: -38.5267 },
  'recife': { lat: -8.0476, lng: -34.8770 },
  'porto alegre': { lat: -30.0346, lng: -51.2177 },
  'curitiba': { lat: -25.4244, lng: -49.2654 },
  'goiânia': { lat: -16.6869, lng: -49.2648 },
  'manaus': { lat: -3.1190, lng: -60.0217 },
  'belém': { lat: -1.4558, lng: -48.5044 },
  'guarulhos': { lat: -23.4538, lng: -46.5333 },
  'campinas': { lat: -22.9099, lng: -47.0626 },
  'nova iguaçu': { lat: -22.7591, lng: -43.4509 },
  'maceió': { lat: -9.6658, lng: -35.7353 },
  'duque de caxias': { lat: -22.7858, lng: -43.3111 },
  'natal': { lat: -5.7945, lng: -35.2110 },
  'teresina': { lat: -5.0892, lng: -42.8019 },
  'são bernardo do campo': { lat: -23.6914, lng: -46.5646 },
  'joão pessoa': { lat: -7.1195, lng: -34.8450 },
  'osasco': { lat: -23.5329, lng: -46.7918 },
  'santo andré': { lat: -23.6739, lng: -46.5388 },
  'jaboatão dos guararapes': { lat: -8.1130, lng: -35.0145 },
  'contagem': { lat: -19.9317, lng: -44.0536 },
  'aracaju': { lat: -10.9472, lng: -37.0731 },
  'cuiabá': { lat: -15.6014, lng: -56.0979 },
  'feira de santana': { lat: -12.2662, lng: -38.9663 },
  'ribeirão preto': { lat: -21.1775, lng: -47.8133 },
  'sorocaba': { lat: -23.5018, lng: -47.4581 },
  'niterói': { lat: -22.8833, lng: -43.1036 },
  'caxias do sul': { lat: -29.1634, lng: -51.1797 },
  'londrina': { lat: -23.3045, lng: -51.1696 },
  'joinville': { lat: -26.3044, lng: -48.8487 },
  'santos': { lat: -23.9618, lng: -46.3322 },
  'mauá': { lat: -23.6678, lng: -46.4617 },
  'são josé dos campos': { lat: -23.2237, lng: -45.9009 },
  'mogi das cruzes': { lat: -23.5227, lng: -46.1881 },
  'diadema': { lat: -23.6861, lng: -46.6237 },
  'betim': { lat: -19.9681, lng: -44.1987 },
  'jundiaí': { lat: -23.1864, lng: -46.8842 },
  'carapicuíba': { lat: -23.5225, lng: -46.8356 },
  'piracicaba': { lat: -22.7253, lng: -47.6492 },
  'bauru': { lat: -22.3147, lng: -49.0608 },
  'itaquaquecetuba': { lat: -23.4864, lng: -46.3478 },
  'são vicente': { lat: -23.9629, lng: -46.3918 },
  'franca': { lat: -20.5386, lng: -47.4006 },
  'canoas': { lat: -29.9177, lng: -51.1833 },
  'vitória da conquista': { lat: -14.8619, lng: -40.8444 },
  'uberaba': { lat: -19.7517, lng: -47.9319 },
  'paulista': { lat: -7.9408, lng: -34.8728 },
  'limeira': { lat: -22.5647, lng: -47.4017 },
  'suzano': { lat: -23.5425, lng: -46.3108 },
  'são caetano do sul': { lat: -23.6181, lng: -46.5553 },
  'taboão da serra': { lat: -23.6093, lng: -46.7586 },
  'sumaré': { lat: -22.8219, lng: -47.2669 },
  'governador valadares': { lat: -18.8511, lng: -41.9495 },
  'taubaté': { lat: -23.0262, lng: -45.5553 },
  'nossa senhora do socorro': { lat: -10.8550, lng: -37.1264 },
  'gravataí': { lat: -29.9442, lng: -50.9928 },
  'viamão': { lat: -30.0811, lng: -51.0233 },
  'várzea grande': { lat: -15.6467, lng: -56.1325 },
  'botucatu': { lat: -22.8833, lng: -48.4450 },
  'embu das artes': { lat: -23.6489, lng: -46.8519 },
  'volta redonda': { lat: -22.5231, lng: -44.1044 },
  'rio branco': { lat: -9.9750, lng: -67.8243 },
  'presidente prudente': { lat: -22.1256, lng: -51.3889 },
  'petrolina': { lat: -9.3891, lng: -40.5030 },
  'santa maria': { lat: -29.6842, lng: -53.8069 },
  'araraquara': { lat: -21.7947, lng: -48.1756 },
  'dourados': { lat: -22.2211, lng: -54.8056 },
  'santarém': { lat: -2.4093, lng: -54.7081 },
  'juiz de fora': { lat: -21.7642, lng: -43.3467 },
  'são josé do rio preto': { lat: -20.8197, lng: -49.3794 },
  'chapecó': { lat: -27.0965, lng: -52.6147 },
  'rio das ostras': { lat: -22.5233, lng: -41.9456 },
  'cotia': { lat: -23.6039, lng: -46.9189 },
  'ferraz de vasconcelos': { lat: -23.5425, lng: -46.3686 },
  'boa vista': { lat: 2.8235, lng: -60.6758 },
  'indaiatuba': { lat: -23.0919, lng: -47.2178 },
  'itapecerica da serra': { lat: -23.7167, lng: -46.8489 },
  'marabá': { lat: -5.3678, lng: -49.1178 },
  'ponta grossa': { lat: -25.0950, lng: -50.1619 },
  'rio grande': { lat: -32.0350, lng: -52.0986 },
  'lauro de freitas': { lat: -12.8944, lng: -38.3275 },
  'francisco morato': { lat: -23.2822, lng: -46.7456 },
  'foz do iguaçu': { lat: -25.5478, lng: -54.5882 },
  'pelotas': { lat: -31.7654, lng: -52.3376 },
  'blumenau': { lat: -26.9194, lng: -49.0661 },
  'são carlos': { lat: -22.0175, lng: -47.8908 },
  'cascavel': { lat: -24.9578, lng: -53.4551 },
  'colombo': { lat: -25.2917, lng: -49.2244 },
  'ribeirão das neves': { lat: -19.7669, lng: -44.0869 },
  'porto velho': { lat: -8.7619, lng: -63.9039 },
  'passo fundo': { lat: -28.2636, lng: -52.4069 },
  'sobral': { lat: -3.6956, lng: -40.3497 },
  'novo hamburgo': { lat: -29.6783, lng: -51.1306 },
  'guarujá': { lat: -24.0044, lng: -46.2564 },
  'praia grande': { lat: -24.0058, lng: -46.4028 },
  'palmas': { lat: -10.1842, lng: -48.3336 },
  'camaçari': { lat: -12.6975, lng: -38.3244 },
  'mossoró': { lat: -5.1875, lng: -37.3444 },
  'macapá': { lat: 0.0389, lng: -51.0664 },
  'petrópolis': { lat: -22.5053, lng: -43.1778 },
  'corumbá': { lat: -19.0067, lng: -57.6533 },
  'três lagoas': { lat: -20.7514, lng: -51.6789 },
  'itu': { lat: -23.2644, lng: -47.2992 },
  'paranaguá': { lat: -25.5197, lng: -48.5089 },
  'são leopoldo': { lat: -29.7603, lng: -51.1472 },
  'cachoeiro de itapemirim': { lat: -20.8486, lng: -41.1128 },
  'lages': { lat: -27.8167, lng: -50.3267 },
  'parnamirim': { lat: -5.9150, lng: -35.2639 },
  'itabuna': { lat: -14.7858, lng: -39.2803 },
  'guarapuava': { lat: -25.3842, lng: -51.4581 },
  'uruguaiana': { lat: -29.7547, lng: -57.0881 },
  'paranavaí': { lat: -23.0728, lng: -52.4647 },
  'rio claro': { lat: -22.4147, lng: -47.5617 },
  'bagé': { lat: -31.3289, lng: -54.1069 },
  'ipatinga': { lat: -19.4681, lng: -42.5369 },
  'apucarana': { lat: -23.5508, lng: -51.4611 },
  'vinhedo': { lat: -23.0300, lng: -46.9756 },
  'araçatuba': { lat: -21.2089, lng: -50.4328 },
  'toledo': { lat: -24.7136, lng: -53.7431 },
  'teixeira de freitas': { lat: -17.5392, lng: -39.7367 },
  'maringá': { lat: -23.4205, lng: -51.9331 },
  'itajaí': { lat: -26.9078, lng: -48.6631 },
  'uberlândia': { lat: -18.9186, lng: -48.2772 },
  'vitória': { lat: -20.3155, lng: -40.3128 },
  'florianópolis': { lat: -27.5969, lng: -48.5495 },
  'macaé': { lat: -22.3711, lng: -41.7869 },
  'anápolis': { lat: -16.3267, lng: -48.9531 },
  'vila velha': { lat: -20.3297, lng: -40.2925 },
  'montes claros': { lat: -16.7289, lng: -43.8636 },
  'marília': { lat: -22.2147, lng: -49.9456 },
  'ilhéus': { lat: -14.7889, lng: -39.0453 },
  'cabo frio': { lat: -22.8792, lng: -42.0186 },
  'umuarama': { lat: -23.7636, lng: -53.3275 },
  'imperatriz': { lat: -5.5264, lng: -47.4919 },
  'rondonópolis': { lat: -16.4706, lng: -54.6353 },
  'sinop': { lat: -11.8642, lng: -55.5022 },
  'santana de parnaíba': { lat: -23.4422, lng: -46.9181 },
  'são josé dos pinhais': { lat: -25.5319, lng: -49.2064 },
  'catanduva': { lat: -21.1378, lng: -48.9728 },
  'francisco beltrão': { lat: -26.0811, lng: -53.0553 },
  'patos de minas': { lat: -18.5786, lng: -46.5178 },
  'nova friburgo': { lat: -22.2819, lng: -42.5311 },
  'angra dos reis': { lat: -23.0067, lng: -44.3178 },
  'magé': { lat: -22.6567, lng: -43.0403 },
  'americana': { lat: -22.7378, lng: -47.3311 },
  'santa bárbara d\'oeste': { lat: -22.7511, lng: -47.4139 },
  'são mateus': { lat: -18.7167, lng: -39.8581 },
  'jacareí': { lat: -23.3053, lng: -45.9656 },
  'itapetininga': { lat: -23.5917, lng: -48.0528 },
  'linhares': { lat: -19.3911, lng: -40.0719 },
  'maracanaú': { lat: -3.8761, lng: -38.6256 },
  'caucaia': { lat: -3.7361, lng: -38.6531 },
  'araguaína': { lat: -7.1911, lng: -48.2072 },
  'leme': { lat: -22.1847, lng: -47.3928 },
  'itapevi': { lat: -23.5489, lng: -46.9342 },
  'franco da rocha': { lat: -23.3264, lng: -46.7264 },
  'são sebastião': { lat: -23.8067, lng: -45.4069 },
  'águas de lindóia': { lat: -22.4783, lng: -46.6325 },
  'santo antônio do descoberto': { lat: -15.9456, lng: -48.2647 },
  'tijucas': { lat: -27.2386, lng: -48.6342 },
  'capão da canoa': { lat: -29.7450, lng: -50.0114 },
  'cianorte': { lat: -23.6636, lng: -52.6053 },
  'aparecida de goiânia': { lat: -16.8239, lng: -49.2439 },
  'campo largo': { lat: -25.4597, lng: -49.5267 },
  'arapiraca': { lat: -9.7517, lng: -36.6611 },
  'criciúma': { lat: -28.6778, lng: -49.3694 },
  'itaboraí': { lat: -22.7444, lng: -42.8597 },
  'aquiraz': { lat: -3.9011, lng: -38.3911 },
  'muriaé': { lat: -21.1306, lng: -42.3664 },
  'nova lima': { lat: -19.9858, lng: -43.8464 },
  'eunápolis': { lat: -16.3772, lng: -39.5811 },
  'cariacica': { lat: -20.2622, lng: -40.4178 },
  'serra': { lat: -20.1289, lng: -40.3078 },
  'formosa': { lat: -15.5372, lng: -47.3342 },
  'três corações': { lat: -21.6911, lng: -45.2536 },
  'planaltina': { lat: -15.6178, lng: -47.6481 },
  'campos dos goytacazes': { lat: -21.7517, lng: -41.3297 }
};

/**
 * Obtém coordenadas aproximadas baseadas no nome da cidade
 */
export const getCityCoordinates = (cityName: string): { lat: number; lng: number } | null => {
  if (!cityName) return null;
  
  const normalizedCity = cityName.toLowerCase().trim();
  return CITY_COORDINATES[normalizedCity] || null;
};

/**
 * Gera coordenadas baseadas na localização do salão
 */
export const generateSalonCoordinates = (salon: {
  city?: string;
  state?: string;
  address?: string;
  id: string;
}): { lat: number; lng: number } => {
  // Primeiro, tentar usar coordenadas da cidade
  if (salon.city) {
    const cityCoords = getCityCoordinates(salon.city);
    if (cityCoords) {
      // Adicionar pequena variação para evitar sobreposição
      const hash = hashString(salon.id);
      const variation = 0.05; // ~5km de variação
      return {
        lat: cityCoords.lat + (hash % 1000 / 1000 - 0.5) * variation,
        lng: cityCoords.lng + ((hash >> 10) % 1000 / 1000 - 0.5) * variation
      };
    }
  }
  
  // Fallback para coordenadas do estado ou região
  if (salon.state) {
    const stateCoords = getStateCoordinates(salon.state);
    if (stateCoords) {
      const hash = hashString(salon.id);
      const variation = 1.0; // ~100km de variação para estado
      return {
        lat: stateCoords.lat + (hash % 1000 / 1000 - 0.5) * variation,
        lng: stateCoords.lng + ((hash >> 10) % 1000 / 1000 - 0.5) * variation
      };
    }
  }
  
  // Fallback final para centro do Brasil
  const hash = hashString(salon.id);
  const variation = 5.0; // ~500km de variação
  return {
    lat: -15.7942 + (hash % 1000 / 1000 - 0.5) * variation,
    lng: -47.8825 + ((hash >> 10) % 1000 / 1000 - 0.5) * variation
  };
};

/**
 * Obtém coordenadas aproximadas do centro de um estado
 */
const getStateCoordinates = (state: string): { lat: number; lng: number } | null => {
  const stateMap: Record<string, { lat: number; lng: number }> = {
    'ms': { lat: -20.4628, lng: -54.6178 }, // Campo Grande
    'sp': { lat: -23.5505, lng: -46.6333 }, // São Paulo
    'rj': { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
    'mg': { lat: -19.9191, lng: -43.9386 }, // Belo Horizonte
    'rs': { lat: -30.0346, lng: -51.2177 }, // Porto Alegre
    'pr': { lat: -25.4244, lng: -49.2654 }, // Curitiba
    'sc': { lat: -27.5969, lng: -48.5495 }, // Florianópolis
    'ba': { lat: -12.9714, lng: -38.5014 }, // Salvador
    'go': { lat: -16.6869, lng: -49.2648 }, // Goiânia
    'mt': { lat: -15.6014, lng: -56.0979 }, // Cuiabá
    'df': { lat: -15.8267, lng: -47.9218 }, // Brasília
    'es': { lat: -20.3155, lng: -40.3128 }, // Vitória
    'ce': { lat: -3.7319, lng: -38.5267 },  // Fortaleza
    'pe': { lat: -8.0476, lng: -34.8770 },  // Recife
    'pb': { lat: -7.1195, lng: -34.8450 },  // João Pessoa
    'rn': { lat: -5.7945, lng: -35.2110 },  // Natal
    'al': { lat: -9.6658, lng: -35.7353 },  // Maceió
    'se': { lat: -10.9472, lng: -37.0731 }, // Aracaju
    'pi': { lat: -5.0892, lng: -42.8019 },  // Teresina
    'ma': { lat: -2.5307, lng: -44.3068 },  // São Luís
    'pa': { lat: -1.4558, lng: -48.5044 },  // Belém
    'am': { lat: -3.1190, lng: -60.0217 },  // Manaus
    'ro': { lat: -8.7619, lng: -63.9039 },  // Porto Velho
    'ac': { lat: -9.9750, lng: -67.8243 },  // Rio Branco
    'rr': { lat: 2.8235, lng: -60.6758 },   // Boa Vista
    'ap': { lat: 0.0389, lng: -51.0664 },   // Macapá
    'to': { lat: -10.1842, lng: -48.3336 }  // Palmas
  };
  
  return stateMap[state.toLowerCase()] || null;
};

/**
 * Gera hash simples de uma string para coordenadas consistentes
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};