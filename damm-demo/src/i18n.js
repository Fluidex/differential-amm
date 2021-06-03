import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  debug: true,
  lng: 'zh',
  resources: {
    en: {
      translation: {
        setPrice: 'Preset price and depth',
        autoComputePrice: 'Preset price range and token amount',
        maxPrice: 'max price',
        minPrice: 'min price',
        tokenAmount: 'amount',
        price: 'price',
        depth: 'depth',
        customizePriceRange: 'customize price range',
        customizeTokenAmount: 'customize token amount',
      },
    },
    zh: {
      translation: {
        setPrice: '指定盘口价格和深度',
        autoComputePrice: '指定价格范围和资金量',
        maxPrice: '最高价',
        minPrice: '最低价',
        tokenAmount: '做市资金量',
        price: '盘口价格',
        depth: '盘口深度',
        customizePriceRange: '自定义做市价格范围',
        customizeTokenAmount: '自定义做市资金量',
      },
    },
  },
  react: {
    wait: false,
    bindI18n: 'languageChanged loaded',
    bindStore: 'added removed',
    nsMode: 'default',
  },
});

export default i18n;
