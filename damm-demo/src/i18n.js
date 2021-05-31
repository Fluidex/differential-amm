import i18n from 'i18next';
import { initReactI18next } from "react-i18next";

i18n
.use(initReactI18next)
.init({
  debug: true,
  lng: 'zh',
  resources: {
    'en':{
      'translation': {
        setPrice: 'Set price and depth',
        autoComputePrice: 'Compute price automatically'
      }
    },
    'zh':{
      'translation': {
        setPrice: '指定盘口价格和深度',
        autoComputePrice: '自动计算盘口价格和深度'
      }
    },
  },
  react: {
    wait: false,
    bindI18n: 'languageChanged loaded',
    bindStore: 'added removed',
    nsMode: 'default'
  }
});

export default i18n