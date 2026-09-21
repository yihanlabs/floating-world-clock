'use strict';

/**
 * Time zone catalogue.
 *
 * `META` maps a canonical IANA zone id to the short label shown in the UI
 * (`SH, China`), a Chinese city name for searching, and optional alternate
 * spellings (`aka`) so queries like "Frankfurt" or "孟买" still find the right zone.
 *
 * Zones absent from META still work -- `labelFor` derives a readable label from the
 * IANA id itself.
 */

/* eslint-disable quote-props */

const META = {
  // -- Greater China -------------------------------------------------------
  'Asia/Shanghai': { code: 'SH', country: 'China', city: '上海', aka: ['Beijing', 'BJ', '北京', 'Shenzhen', 'SZ', '深圳', 'Guangzhou', 'CAN', '广州', 'Chengdu', 'CTU', '成都', 'Hangzhou', 'HGH', '杭州'] },
  'Asia/Urumqi': { code: 'URC', country: 'China', city: '乌鲁木齐' },
  'Asia/Hong_Kong': { code: 'HK', country: 'China', city: '香港' },
  'Asia/Macau': { code: 'MO', country: 'China', city: '澳门' },
  'Asia/Taipei': { code: 'TPE', country: 'China', city: '台北', aka: ['Taiwan', '台湾'] },

  // -- Asia ----------------------------------------------------------------
  'Asia/Tokyo': { code: 'TYO', country: 'Japan', city: '东京', aka: ['Tokyo'] },
  'Asia/Seoul': { code: 'SEL', country: 'Korea', city: '首尔', aka: ['Seoul'] },
  'Asia/Pyongyang': { code: 'FNJ', country: 'North Korea', city: '平壤' },
  'Asia/Singapore': { code: 'SG', country: 'Singapore', city: '新加坡' },
  'Asia/Kuala_Lumpur': { code: 'KL', country: 'Malaysia', city: '吉隆坡' },
  'Asia/Bangkok': { code: 'BKK', country: 'Thailand', city: '曼谷' },
  'Asia/Jakarta': { code: 'JKT', country: 'Indonesia', city: '雅加达' },
  'Asia/Makassar': { code: 'UPG', country: 'Indonesia', city: '望加锡' },
  'Asia/Jayapura': { code: 'DJJ', country: 'Indonesia', city: '查亚普拉' },
  'Asia/Manila': { code: 'MNL', country: 'Philippines', city: '马尼拉' },
  'Asia/Ho_Chi_Minh': { code: 'SGN', country: 'Vietnam', city: '胡志明市', aka: ['Saigon', '西贡'] },
  'Asia/Phnom_Penh': { code: 'PNH', country: 'Cambodia', city: '金边' },
  'Asia/Vientiane': { code: 'VTE', country: 'Laos', city: '万象' },
  'Asia/Yangon': { code: 'RGN', country: 'Myanmar', city: '仰光', aka: ['Rangoon'] },
  'Asia/Dhaka': { code: 'DAC', country: 'Bangladesh', city: '达卡' },
  'Asia/Kolkata': { code: 'DEL', country: 'India', city: '新德里', aka: ['Delhi', 'Mumbai', 'BOM', 'Bombay', '孟买', 'Kolkata', 'CCU', 'Calcutta', '加尔各答', 'Bangalore', 'BLR', '班加罗尔'] },
  'Asia/Colombo': { code: 'CMB', country: 'Sri Lanka', city: '科伦坡' },
  'Asia/Kathmandu': { code: 'KTM', country: 'Nepal', city: '加德满都', aka: ['Katmandu'] },
  'Asia/Karachi': { code: 'KHI', country: 'Pakistan', city: '卡拉奇' },
  'Asia/Kabul': { code: 'KBL', country: 'Afghanistan', city: '喀布尔' },
  'Asia/Tashkent': { code: 'TAS', country: 'Uzbekistan', city: '塔什干' },
  'Asia/Almaty': { code: 'ALA', country: 'Kazakhstan', city: '阿拉木图' },
  'Asia/Bishkek': { code: 'FRU', country: 'Kyrgyzstan', city: '比什凯克' },
  'Asia/Dushanbe': { code: 'DYU', country: 'Tajikistan', city: '杜尚别' },
  'Asia/Ashgabat': { code: 'ASB', country: 'Turkmenistan', city: '阿什哈巴德' },
  'Asia/Baku': { code: 'GYD', country: 'Azerbaijan', city: '巴库' },
  'Asia/Tbilisi': { code: 'TBS', country: 'Georgia', city: '第比利斯' },
  'Asia/Yerevan': { code: 'EVN', country: 'Armenia', city: '埃里温' },
  'Asia/Tehran': { code: 'THR', country: 'Iran', city: '德黑兰' },
  'Asia/Baghdad': { code: 'BGW', country: 'Iraq', city: '巴格达' },
  'Asia/Riyadh': { code: 'RUH', country: 'Saudi Arabia', city: '利雅得' },
  'Asia/Dubai': { code: 'DXB', country: 'UAE', city: '迪拜' },
  'Asia/Qatar': { code: 'DOH', country: 'Qatar', city: '多哈' },
  'Asia/Kuwait': { code: 'KWI', country: 'Kuwait', city: '科威特城' },
  'Asia/Bahrain': { code: 'BAH', country: 'Bahrain', city: '麦纳麦' },
  'Asia/Muscat': { code: 'MCT', country: 'Oman', city: '马斯喀特' },
  'Asia/Amman': { code: 'AMM', country: 'Jordan', city: '安曼' },
  'Asia/Beirut': { code: 'BEY', country: 'Lebanon', city: '贝鲁特' },
  'Asia/Damascus': { code: 'DAM', country: 'Syria', city: '大马士革' },
  'Asia/Jerusalem': { code: 'TLV', country: 'Israel', city: '耶路撒冷', aka: ['Tel Aviv', '特拉维夫'] },
  'Asia/Ulaanbaatar': { code: 'ULN', country: 'Mongolia', city: '乌兰巴托' },
  'Asia/Brunei': { code: 'BWN', country: 'Brunei', city: '斯里巴加湾市' },
  'Asia/Dili': { code: 'DIL', country: 'Timor-Leste', city: '帝力' },
  'Asia/Thimphu': { code: 'PBH', country: 'Bhutan', city: '廷布' },
  'Asia/Yekaterinburg': { code: 'SVX', country: 'Russia', city: '叶卡捷琳堡' },
  'Asia/Novosibirsk': { code: 'OVB', country: 'Russia', city: '新西伯利亚' },
  'Asia/Krasnoyarsk': { code: 'KJA', country: 'Russia', city: '克拉斯诺亚尔斯克' },
  'Asia/Irkutsk': { code: 'IKT', country: 'Russia', city: '伊尔库茨克' },
  'Asia/Vladivostok': { code: 'VVO', country: 'Russia', city: '符拉迪沃斯托克', aka: ['海参崴'] },
  'Asia/Magadan': { code: 'GDX', country: 'Russia', city: '马加丹' },
  'Asia/Kamchatka': { code: 'PKC', country: 'Russia', city: '堪察加' },

  // -- Europe --------------------------------------------------------------
  'Europe/London': { code: 'LON', country: 'UK', city: '伦敦', aka: ['England', '英国'] },
  'Europe/Dublin': { code: 'DUB', country: 'Ireland', city: '都柏林' },
  'Europe/Lisbon': { code: 'LIS', country: 'Portugal', city: '里斯本' },
  'Europe/Madrid': { code: 'MAD', country: 'Spain', city: '马德里', aka: ['Barcelona', 'BCN', '巴塞罗那'] },
  'Europe/Paris': { code: 'PAR', country: 'France', city: '巴黎' },
  'Europe/Brussels': { code: 'BRU', country: 'Belgium', city: '布鲁塞尔' },
  'Europe/Amsterdam': { code: 'AMS', country: 'Netherlands', city: '阿姆斯特丹', aka: ['Holland', '荷兰'] },
  'Europe/Luxembourg': { code: 'LUX', country: 'Luxembourg', city: '卢森堡' },
  'Europe/Berlin': { code: 'BER', country: 'Germany', city: '柏林', aka: ['Frankfurt', 'FRA', '法兰克福', 'Munich', 'MUC', '慕尼黑', 'Hamburg', 'HAM', '汉堡'] },
  'Europe/Zurich': { code: 'ZRH', country: 'Switzerland', city: '苏黎世', aka: ['Geneva', 'GVA', '日内瓦'] },
  'Europe/Vienna': { code: 'VIE', country: 'Austria', city: '维也纳' },
  'Europe/Rome': { code: 'ROM', country: 'Italy', city: '罗马', aka: ['Milan', 'MIL', '米兰'] },
  'Europe/Prague': { code: 'PRG', country: 'Czechia', city: '布拉格', aka: ['Czech Republic'] },
  'Europe/Warsaw': { code: 'WAW', country: 'Poland', city: '华沙' },
  'Europe/Budapest': { code: 'BUD', country: 'Hungary', city: '布达佩斯' },
  'Europe/Bratislava': { code: 'BTS', country: 'Slovakia', city: '布拉迪斯拉发' },
  'Europe/Ljubljana': { code: 'LJU', country: 'Slovenia', city: '卢布尔雅那' },
  'Europe/Zagreb': { code: 'ZAG', country: 'Croatia', city: '萨格勒布' },
  'Europe/Belgrade': { code: 'BEG', country: 'Serbia', city: '贝尔格莱德' },
  'Europe/Sarajevo': { code: 'SJJ', country: 'Bosnia and Herzegovina', city: '萨拉热窝' },
  'Europe/Skopje': { code: 'SKP', country: 'North Macedonia', city: '斯科普里' },
  'Europe/Tirane': { code: 'TIA', country: 'Albania', city: '地拉那' },
  'Europe/Bucharest': { code: 'OTP', country: 'Romania', city: '布加勒斯特' },
  'Europe/Sofia': { code: 'SOF', country: 'Bulgaria', city: '索非亚' },
  'Europe/Athens': { code: 'ATH', country: 'Greece', city: '雅典' },
  'Europe/Istanbul': { code: 'IST', country: 'Turkey', city: '伊斯坦布尔', aka: ['Istanbul', 'Türkiye', '土耳其'] },
  'Europe/Kyiv': { code: 'IEV', country: 'Ukraine', city: '基辅', aka: ['Kiev'] },
  'Europe/Moscow': { code: 'MOW', country: 'Russia', city: '莫斯科' },
  'Europe/Minsk': { code: 'MSQ', country: 'Belarus', city: '明斯克' },
  'Europe/Riga': { code: 'RIX', country: 'Latvia', city: '里加' },
  'Europe/Vilnius': { code: 'VNO', country: 'Lithuania', city: '维尔纽斯' },
  'Europe/Tallinn': { code: 'TLL', country: 'Estonia', city: '塔林' },
  'Europe/Helsinki': { code: 'HEL', country: 'Finland', city: '赫尔辛基' },
  'Europe/Stockholm': { code: 'STO', country: 'Sweden', city: '斯德哥尔摩' },
  'Europe/Oslo': { code: 'OSL', country: 'Norway', city: '奥斯陆' },
  'Europe/Copenhagen': { code: 'CPH', country: 'Denmark', city: '哥本哈根' },
  'Europe/Chisinau': { code: 'KIV', country: 'Moldova', city: '基希讷乌' },
  'Europe/Malta': { code: 'MLA', country: 'Malta', city: '瓦莱塔' },
  'Europe/Monaco': { code: 'MCM', country: 'Monaco', city: '摩纳哥' },
  'Europe/Gibraltar': { code: 'GIB', country: 'UK', city: '直布罗陀' },
  'Europe/Kaliningrad': { code: 'KGD', country: 'Russia', city: '加里宁格勒' },
  'Europe/Samara': { code: 'KUF', country: 'Russia', city: '萨马拉' },

  // -- Africa --------------------------------------------------------------
  'Africa/Cairo': { code: 'CAI', country: 'Egypt', city: '开罗' },
  'Africa/Johannesburg': { code: 'JNB', country: 'South Africa', city: '约翰内斯堡', aka: ['Cape Town', 'CPT', '开普敦'] },
  'Africa/Lagos': { code: 'LOS', country: 'Nigeria', city: '拉各斯' },
  'Africa/Nairobi': { code: 'NBO', country: 'Kenya', city: '内罗毕' },
  'Africa/Casablanca': { code: 'CAS', country: 'Morocco', city: '卡萨布兰卡' },
  'Africa/Accra': { code: 'ACC', country: 'Ghana', city: '阿克拉' },
  'Africa/Addis_Ababa': { code: 'ADD', country: 'Ethiopia', city: '亚的斯亚贝巴' },
  'Africa/Algiers': { code: 'ALG', country: 'Algeria', city: '阿尔及尔' },
  'Africa/Tunis': { code: 'TUN', country: 'Tunisia', city: '突尼斯' },
  'Africa/Khartoum': { code: 'KRT', country: 'Sudan', city: '喀土穆' },
  'Africa/Dar_es_Salaam': { code: 'DAR', country: 'Tanzania', city: '达累斯萨拉姆' },
  'Africa/Kampala': { code: 'KLA', country: 'Uganda', city: '坎帕拉' },
  'Africa/Abidjan': { code: 'ABJ', country: "Côte d'Ivoire", city: '阿比让' },
  'Africa/Dakar': { code: 'DKR', country: 'Senegal', city: '达喀尔' },

  // -- North & South America ----------------------------------------------
  'America/New_York': { code: 'NY', country: 'US', city: '纽约', aka: ['New York', 'NYC', '曼哈顿'] },
  'America/Chicago': { code: 'CHI', country: 'US', city: '芝加哥' },
  'America/Denver': { code: 'DEN', country: 'US', city: '丹佛' },
  'America/Phoenix': { code: 'PHX', country: 'US', city: '菲尼克斯', aka: ['Phoenix'] },
  'America/Los_Angeles': { code: 'LA', country: 'US', city: '洛杉矶', aka: ['Los Angeles', '硅谷', 'Silicon Valley'] },
  'America/Anchorage': { code: 'ANC', country: 'US', city: '安克雷奇' },
  'America/Adak': { code: 'ADK', country: 'US', city: '阿达克' },
  'Pacific/Honolulu': { code: 'HNL', country: 'US', city: '檀香山', aka: ['Hawaii', '夏威夷'] },
  'America/Puerto_Rico': { code: 'SJU', country: 'US', city: '圣胡安' },
  'America/Toronto': { code: 'TO', country: 'Canada', city: '多伦多' },
  'America/Vancouver': { code: 'VA', country: 'Canada', city: '温哥华' },
  'America/Edmonton': { code: 'YEG', country: 'Canada', city: '埃德蒙顿', aka: ['Calgary', 'YYC', '卡尔加里'] },
  'America/Winnipeg': { code: 'YWG', country: 'Canada', city: '温尼伯' },
  'America/Halifax': { code: 'YHZ', country: 'Canada', city: '哈利法克斯' },
  'America/St_Johns': { code: 'YYT', country: 'Canada', city: '圣约翰斯' },
  'America/Mexico_City': { code: 'MEX', country: 'Mexico', city: '墨西哥城' },
  'America/Tijuana': { code: 'TIJ', country: 'Mexico', city: '蒂华纳' },
  'America/Sao_Paulo': { code: 'SAO', country: 'Brazil', city: '圣保罗', aka: ['Rio de Janeiro', 'RIO', '里约热内卢'] },
  'America/Manaus': { code: 'MAO', country: 'Brazil', city: '马瑙斯' },
  'America/Argentina/Buenos_Aires': { code: 'BUE', country: 'Argentina', city: '布宜诺斯艾利斯' },
  'America/Santiago': { code: 'SCL', country: 'Chile', city: '圣地亚哥' },
  'America/Lima': { code: 'LIM', country: 'Peru', city: '利马' },
  'America/Bogota': { code: 'BOG', country: 'Colombia', city: '波哥大' },
  'America/Caracas': { code: 'CCS', country: 'Venezuela', city: '加拉加斯' },
  'America/Panama': { code: 'PTY', country: 'Panama', city: '巴拿马城' },
  'America/Havana': { code: 'HAV', country: 'Cuba', city: '哈瓦那' },
  'America/Guatemala': { code: 'GUA', country: 'Guatemala', city: '危地马拉城' },
  'America/Santo_Domingo': { code: 'SDQ', country: 'Dominican Republic', city: '圣多明各' },
  'America/Montevideo': { code: 'MVD', country: 'Uruguay', city: '蒙得维的亚' },
  'America/La_Paz': { code: 'LPB', country: 'Bolivia', city: '拉巴斯' },
  'America/Asuncion': { code: 'ASU', country: 'Paraguay', city: '亚松森' },
  'America/Guayaquil': { code: 'GYE', country: 'Ecuador', city: '瓜亚基尔' },
  'America/El_Salvador': { code: 'SAL', country: 'El Salvador', city: '圣萨尔瓦多' },
  'America/Tegucigalpa': { code: 'TGU', country: 'Honduras', city: '特古西加尔巴' },
  'America/Managua': { code: 'MGA', country: 'Nicaragua', city: '马那瓜' },
  'America/Costa_Rica': { code: 'SJO', country: 'Costa Rica', city: '圣何塞' },
  'America/Nassau': { code: 'NAS', country: 'Bahamas', city: '拿骚' },
  'Atlantic/Reykjavik': { code: 'REK', country: 'Iceland', city: '雷克雅未克' },

  // -- Oceania -------------------------------------------------------------
  'Australia/Sydney': { code: 'SYD', country: 'Australia', city: '悉尼', aka: ['Canberra', 'CBR', '堪培拉'] },
  'Australia/Melbourne': { code: 'MEL', country: 'Australia', city: '墨尔本' },
  'Australia/Brisbane': { code: 'BNE', country: 'Australia', city: '布里斯班' },
  'Australia/Perth': { code: 'PER', country: 'Australia', city: '珀斯' },
  'Australia/Adelaide': { code: 'ADL', country: 'Australia', city: '阿德莱德' },
  'Australia/Darwin': { code: 'DRW', country: 'Australia', city: '达尔文' },
  'Australia/Hobart': { code: 'HBA', country: 'Australia', city: '霍巴特' },
  'Pacific/Auckland': { code: 'AKL', country: 'New Zealand', city: '奥克兰', aka: ['Wellington', 'WLG', '惠灵顿'] },
  'Pacific/Fiji': { code: 'NAN', country: 'Fiji', city: '苏瓦' },
  'Pacific/Guam': { code: 'GUM', country: 'US', city: '关岛' },
  'Pacific/Port_Moresby': { code: 'POM', country: 'Papua New Guinea', city: '莫尔兹比港' },
  'Pacific/Tongatapu': { code: 'TBU', country: 'Tonga', city: '努库阿洛法' },
  'Pacific/Noumea': { code: 'NOU', country: 'France', city: '努美阿' },
  'Pacific/Apia': { code: 'APW', country: 'Samoa', city: '阿皮亚' },
  'Pacific/Midway': { code: 'MDY', country: 'US', city: '中途岛' },
  'Pacific/Norfolk': { code: 'NLF', country: 'Australia', city: '诺福克岛' },

  // -- Indian Ocean --------------------------------------------------------
  'Indian/Maldives': { code: 'MLE', country: 'Maldives', city: '马累' },
  'Indian/Mauritius': { code: 'MRU', country: 'Mauritius', city: '路易港' },
  'Indian/Reunion': { code: 'RUN', country: 'France', city: '留尼汪' },

  // -- Reference -----------------------------------------------------------
  'UTC': { code: 'UTC', country: '', city: '协调世界时', aka: ['GMT', 'Zulu'] }
};

/**
 * The long tail of world capitals, territories and second cities, written in a compact
 * `code|country|中文名[|space separated 别名]` form so the table stays readable.
 * Merged into META below.
 *
 * Deliberately absent: politically contested zones (Europe/Simferopol, Atlantic/Stanley,
 * Asia/Gaza, Asia/Hebron). Those fall through to the neutral IANA-derived label rather
 * than asserting an allegiance.
 */
const EXTRA = {
  // Africa
  'Africa/Harare': 'HRE|Zimbabwe|哈拉雷',
  'Africa/Luanda': 'LAD|Angola|罗安达',
  'Africa/Maputo': 'MPM|Mozambique|马普托',
  'Africa/Lusaka': 'LUN|Zambia|卢萨卡',
  'Africa/Kinshasa': 'FIH|DR Congo|金沙萨',
  'Africa/Brazzaville': 'BZV|Congo|布拉柴维尔',
  'Africa/Libreville': 'LBV|Gabon|利伯维尔',
  'Africa/Douala': 'DLA|Cameroon|杜阿拉',
  'Africa/Gaborone': 'GBE|Botswana|哈博罗内',
  'Africa/Windhoek': 'WDH|Namibia|温得和克',
  'Africa/Mogadishu': 'MGQ|Somalia|摩加迪沙',
  'Africa/Tripoli': 'TIP|Libya|的黎波里',
  'Africa/Ndjamena': 'NDJ|Chad|恩贾梅纳',
  'Africa/Niamey': 'NIM|Niger|尼亚美',
  'Africa/Bamako': 'BKO|Mali|巴马科',
  'Africa/Conakry': 'CKY|Guinea|科纳克里',
  'Africa/Freetown': 'FNA|Sierra Leone|弗里敦',
  'Africa/Ouagadougou': 'OUA|Burkina Faso|瓦加杜古',
  'Africa/Lome': 'LFW|Togo|洛美',
  'Africa/Porto-Novo': 'COO|Benin|波多诺伏',
  'Africa/Bangui': 'BGF|Central African Republic|班吉',
  'Africa/Djibouti': 'JIB|Djibouti|吉布提',
  'Africa/Asmara': 'ASM|Eritrea|阿斯马拉',
  'Africa/Kigali': 'KGL|Rwanda|基加利',
  'Africa/Bujumbura': 'BJM|Burundi|布琼布拉',
  'Africa/Blantyre': 'BLZ|Malawi|布兰太尔',
  'Africa/Maseru': 'MSU|Lesotho|马塞卢',
  'Africa/Mbabane': 'MTS|Eswatini|姆巴巴内',
  'Africa/Juba': 'JUB|South Sudan|朱巴',
  'Africa/Nouakchott': 'NKC|Mauritania|努瓦克肖特',
  'Africa/Monrovia': 'MLW|Liberia|蒙罗维亚',

  // Asia
  'Asia/Nicosia': 'NIC|Cyprus|尼科西亚',
  'Asia/Samarkand': 'SKD|Uzbekistan|撒马尔罕',
  'Asia/Yakutsk': 'YKS|Russia|雅库茨克',
  'Asia/Omsk': 'OMS|Russia|鄂木斯克',
  'Asia/Aden': 'ADE|Yemen|亚丁',
  'Asia/Kuching': 'KCH|Malaysia|古晋',
  'Asia/Pontianak': 'PNK|Indonesia|坤甸',

  // Europe
  'Europe/Andorra': 'ALV|Andorra|安道尔',
  'Europe/Podgorica': 'TGD|Montenegro|波德戈里察',
  'Europe/San_Marino': 'SAU|San Marino|圣马力诺',
  'Europe/Vatican': 'VAT|Vatican|梵蒂冈',
  'Europe/Vaduz': 'VAD|Liechtenstein|瓦杜兹',
  'Europe/Guernsey': 'GCI|Guernsey|根西',
  'Europe/Jersey': 'JER|Jersey|泽西',
  'Europe/Isle_of_Man': 'IOM|Isle of Man|马恩岛',
  'Europe/Mariehamn': 'MHQ|Åland|玛丽港',

  // Atlantic islands and territories
  'Atlantic/Azores': 'AZO|Portugal|亚速尔群岛',
  'Atlantic/Madeira': 'FNC|Portugal|马德拉',
  'Atlantic/Canary': 'LPA|Spain|加那利群岛',
  'Atlantic/Cape_Verde': 'RAI|Cabo Verde|佛得角',
  'Atlantic/Faroe': 'FAE|Faroe Islands|法罗群岛',
  'Atlantic/Bermuda': 'BDA|Bermuda|百慕大',
  'Atlantic/St_Helena': 'HLE|St Helena|圣赫勒拿',

  // Indian Ocean
  'Indian/Antananarivo': 'TNR|Madagascar|塔那那利佛',
  'Indian/Mahe': 'SEZ|Seychelles|维多利亚',
  'Indian/Mayotte': 'DZA|France|马约特',
  'Indian/Comoro': 'HAH|Comoros|莫罗尼',
  'Indian/Cocos': 'CCK|Australia|科科斯群岛',
  'Indian/Christmas': 'XCH|Australia|圣诞岛',

  // Pacific
  'Pacific/Tahiti': 'PPT|France|帕皮提|French Polynesia 法属波利尼西亚 大溪地 塔希提',
  'Pacific/Rarotonga': 'RAR|Cook Islands|阿瓦鲁阿',
  'Pacific/Nauru': 'INU|Nauru|亚伦',
  'Pacific/Palau': 'ROR|Palau|梅莱凯奥克',
  'Pacific/Majuro': 'MAJ|Marshall Islands|马朱罗',
  'Pacific/Tarawa': 'TRW|Kiribati|塔拉瓦',
  'Pacific/Funafuti': 'FUN|Tuvalu|富纳富提',
  'Pacific/Guadalcanal': 'HIR|Solomon Islands|霍尼亚拉',
  'Pacific/Saipan': 'SPN|US|塞班',
  'Pacific/Easter': 'IPC|Chile|复活节岛',
  'Pacific/Galapagos': 'GPS|Ecuador|加拉帕戈斯',
  'Pacific/Chatham': 'CHT|New Zealand|查塔姆群岛',
  'Pacific/Kwajalein': 'KWA|Marshall Islands|夸贾林',
  'Pacific/Niue': 'IUE|Niue|阿洛菲',
  'Pacific/Pohnpei': 'PNI|Micronesia|波纳佩',
  'Pacific/Efate': 'VLI|Vanuatu|维拉港',

  // Americas
  'America/Detroit': 'DET|US|底特律',
  'America/Indianapolis': 'IND|US|印第安纳波利斯',
  'America/Boise': 'BOI|US|博伊西',
  'America/Juneau': 'JNU|US|朱诺',
  'America/Jamaica': 'KIN|Jamaica|金斯敦',
  'America/Barbados': 'BGI|Barbados|布里奇顿',
  'America/Aruba': 'AUA|Aruba|奥拉涅斯塔德',
  'America/Curacao': 'CUR|Curaçao|威廉斯塔德',
  'America/Cayman': 'GCM|Cayman Islands|乔治敦',
  'America/Port_of_Spain': 'POS|Trinidad and Tobago|西班牙港',
  'America/Paramaribo': 'PBM|Suriname|帕拉马里博',
  'America/Cayenne': 'CAY|France|卡宴',
  'America/Monterrey': 'MTY|Mexico|蒙特雷',
  'America/Merida': 'MID|Mexico|梅里达',
  'America/Cancun': 'CUN|Mexico|坎昆',
  'America/Cordoba': 'COR|Argentina|科尔多瓦',
  'America/Mendoza': 'MDZ|Argentina|门多萨',
  'America/Fortaleza': 'FOR|Brazil|福塔莱萨',
  'America/Recife': 'REC|Brazil|累西腓',
  'America/Belem': 'BEL|Brazil|贝伦',
  'America/Whitehorse': 'YXY|Canada|白马市',
  'America/Regina': 'YQR|Canada|里贾纳',
  'America/Belize': 'BZE|Belize|贝尔莫潘',
  'America/Nuuk': 'GOH|Greenland|努克'
};

for (const [tz, spec] of Object.entries(EXTRA)) {
  if (META[tz]) continue;
  const [code, country, city, aka] = spec.split('|');
  META[tz] = aka ? { code, country, city, aka: aka.split(' ') } : { code, country, city };
}

/**
 * Chinese names for every country label, used for *search only* -- the card still shows
 * the English short name so rows stay `SH, China`. Without this, queries like 乌拉圭 or
 * 德国 would find nothing because only the English country name is indexed.
 */
const COUNTRY_ZH = {
  Afghanistan: '阿富汗', Albania: '阿尔巴尼亚', Algeria: '阿尔及利亚', Andorra: '安道尔',
  Angola: '安哥拉', Argentina: '阿根廷', Armenia: '亚美尼亚', Aruba: '阿鲁巴',
  Australia: '澳大利亚', Austria: '奥地利', Azerbaijan: '阿塞拜疆', Bahamas: '巴哈马',
  Bahrain: '巴林', Bangladesh: '孟加拉国', Barbados: '巴巴多斯', Belarus: '白俄罗斯',
  Belgium: '比利时', Belize: '伯利兹', Benin: '贝宁', Bermuda: '百慕大', Bhutan: '不丹',
  Bolivia: '玻利维亚', 'Bosnia and Herzegovina': '波黑', Botswana: '博茨瓦纳',
  Brazil: '巴西', Brunei: '文莱', Bulgaria: '保加利亚', 'Burkina Faso': '布基纳法索',
  Burundi: '布隆迪', 'Cabo Verde': '佛得角', Cambodia: '柬埔寨', Cameroon: '喀麦隆',
  Canada: '加拿大', 'Cayman Islands': '开曼群岛', 'Central African Republic': '中非',
  Chad: '乍得', Chile: '智利', China: '中国', Colombia: '哥伦比亚', Comoros: '科摩罗',
  Congo: '刚果', 'Cook Islands': '库克群岛', 'Costa Rica': '哥斯达黎加',
  Croatia: '克罗地亚', Cuba: '古巴', 'Curaçao': '库拉索', Cyprus: '塞浦路斯',
  Czechia: '捷克', "Côte d'Ivoire": '科特迪瓦', 'DR Congo': '刚果民主共和国',
  Denmark: '丹麦', Djibouti: '吉布提', 'Dominican Republic': '多米尼加',
  Ecuador: '厄瓜多尔', Egypt: '埃及', 'El Salvador': '萨尔瓦多', Eritrea: '厄立特里亚',
  Estonia: '爱沙尼亚', Eswatini: '斯威士兰', Ethiopia: '埃塞俄比亚',
  'Faroe Islands': '法罗群岛', Fiji: '斐济', Finland: '芬兰', France: '法国',
  Gabon: '加蓬', Georgia: '格鲁吉亚', Germany: '德国', Ghana: '加纳', Greece: '希腊',
  Greenland: '格陵兰', Guatemala: '危地马拉', Guernsey: '根西', Guinea: '几内亚',
  Honduras: '洪都拉斯', Hungary: '匈牙利', Iceland: '冰岛', India: '印度',
  Indonesia: '印度尼西亚', Iran: '伊朗', Iraq: '伊拉克', Ireland: '爱尔兰',
  'Isle of Man': '马恩岛', Israel: '以色列', Italy: '意大利', Jamaica: '牙买加',
  Japan: '日本', Jersey: '泽西', Jordan: '约旦', Kazakhstan: '哈萨克斯坦',
  Kenya: '肯尼亚', Kiribati: '基里巴斯', Korea: '韩国', Kuwait: '科威特',
  Kyrgyzstan: '吉尔吉斯斯坦', Laos: '老挝', Latvia: '拉脱维亚', Lebanon: '黎巴嫩',
  Lesotho: '莱索托', Liberia: '利比里亚', Libya: '利比亚',
  Liechtenstein: '列支敦士登', Lithuania: '立陶宛', Luxembourg: '卢森堡',
  Madagascar: '马达加斯加', Malawi: '马拉维', Malaysia: '马来西亚', Maldives: '马尔代夫',
  Mali: '马里', Malta: '马耳他', 'Marshall Islands': '马绍尔群岛',
  Mauritania: '毛里塔尼亚', Mauritius: '毛里求斯', Mexico: '墨西哥',
  Micronesia: '密克罗尼西亚', Moldova: '摩尔多瓦', Monaco: '摩纳哥',
  Mongolia: '蒙古', Montenegro: '黑山', Morocco: '摩洛哥', Mozambique: '莫桑比克',
  Myanmar: '缅甸', Namibia: '纳米比亚', Nauru: '瑙鲁', Nepal: '尼泊尔',
  Netherlands: '荷兰', 'New Zealand': '新西兰', Nicaragua: '尼加拉瓜', Niger: '尼日尔',
  Nigeria: '尼日利亚', Niue: '纽埃', 'North Korea': '朝鲜', 'North Macedonia': '北马其顿',
  Norway: '挪威', Oman: '阿曼', Pakistan: '巴基斯坦', Palau: '帕劳', Panama: '巴拿马',
  'Papua New Guinea': '巴布亚新几内亚', Paraguay: '巴拉圭', Peru: '秘鲁',
  Philippines: '菲律宾', Poland: '波兰', Portugal: '葡萄牙', Qatar: '卡塔尔',
  Romania: '罗马尼亚', Russia: '俄罗斯', Rwanda: '卢旺达', Samoa: '萨摩亚',
  'San Marino': '圣马力诺', 'Saudi Arabia': '沙特阿拉伯', Senegal: '塞内加尔',
  Serbia: '塞尔维亚', Seychelles: '塞舌尔', 'Sierra Leone': '塞拉利昂',
  Singapore: '新加坡', Slovakia: '斯洛伐克', Slovenia: '斯洛文尼亚',
  'Solomon Islands': '所罗门群岛', Somalia: '索马里', 'South Africa': '南非',
  'South Sudan': '南苏丹', Spain: '西班牙', 'Sri Lanka': '斯里兰卡',
  'St Helena': '圣赫勒拿', Sudan: '苏丹', Suriname: '苏里南', Sweden: '瑞典',
  Switzerland: '瑞士', Syria: '叙利亚', Tajikistan: '塔吉克斯坦', Tanzania: '坦桑尼亚',
  Thailand: '泰国', 'Timor-Leste': '东帝汶', Togo: '多哥', Tonga: '汤加',
  'Trinidad and Tobago': '特立尼达和多巴哥', Tunisia: '突尼斯', Turkey: '土耳其',
  Turkmenistan: '土库曼斯坦', Tuvalu: '图瓦卢', UAE: '阿联酋', UK: '英国', US: '美国',
  Uganda: '乌干达', Ukraine: '乌克兰', Uruguay: '乌拉圭', Uzbekistan: '乌兹别克斯坦',
  Vanuatu: '瓦努阿图', Vatican: '梵蒂冈', Venezuela: '委内瑞拉', Vietnam: '越南',
  Yemen: '也门', Zambia: '赞比亚', Zimbabwe: '津巴布韦', Åland: '奥兰群岛'
};

/**
 * The same zone is spelled differently across ICU versions -- newer ones canonicalise
 * to `Asia/Kolkata`, older ones to `Asia/Calcutta`. Every spelling gets a META entry so
 * lookups work either way, but the picker only offers the one the runtime reports.
 */
const ALIAS_GROUPS = [
  ['Asia/Kolkata', 'Asia/Calcutta'],
  ['Asia/Ho_Chi_Minh', 'Asia/Saigon'],
  ['Asia/Yangon', 'Asia/Rangoon'],
  ['Asia/Kathmandu', 'Asia/Katmandu'],
  ['Europe/Kyiv', 'Europe/Kiev'],
  ['America/Argentina/Buenos_Aires', 'America/Buenos_Aires'],
  ['Africa/Asmara', 'Africa/Asmera'],
  ['Atlantic/Faroe', 'Atlantic/Faeroe'],
  ['Pacific/Pohnpei', 'Pacific/Ponape'],
  ['Pacific/Chuuk', 'Pacific/Truk'],
  ['America/Nuuk', 'America/Godthab']
];

for (const group of ALIAS_GROUPS) {
  const source = group.map((tz) => META[tz]).find(Boolean);
  if (!source) continue;
  for (const tz of group) {
    if (!META[tz]) META[tz] = source;
  }
}

/**
 * One-click additions shown as chips in the settings panel. Kept to ten so the wrapped
 * chip block stays two rows tall and the panel does not grow unwieldy. Everything else
 * is still reachable through search.
 */
const PRESETS = [
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney'
];

/** Used when Intl.supportedValuesOf is unavailable (older runtimes). */
const FALLBACK_ZONES = [
  ...Object.keys(META).filter((tz) => !ALIAS_GROUPS.some((group) => group.includes(tz))),
  ...ALIAS_GROUPS.map((group) => group[0])
];

/**
 * The zone that best represents each country, used only to break ranking ties -- the UI
 * preset chips are a separate, shorter list. Without this, searching "France" would
 * offer Cayenne ahead of Paris, because both carry the `France` label.
 */
const PRIMARY_ZONES = [
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Jakarta',
  'Asia/Kuala_Lumpur',
  'Asia/Tashkent',
  'Asia/Almaty',
  'Asia/Ulaanbaatar',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Lisbon',
  'Europe/Zurich',
  'Europe/Amsterdam',
  'Europe/Copenhagen',
  'Europe/Moscow',
  'America/New_York',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Santiago',
  'America/Guayaquil',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Australia/Sydney',
  'Pacific/Auckland'
];

/**
 * Preset order doubles as a prominence ranking, with the representative cities above
 * filling in the rest. Many countries share one label (`US` covers Adak through New
 * York), so ties are broken by which zone a person most likely means.
 */
const PROMINENCE = [...new Set([...PRESETS, ...PRIMARY_ZONES])];
const PROMINENCE_RANK = new Map(PROMINENCE.map((tz, index) => [tz, index]));

function prominence(tz) {
  return PROMINENCE_RANK.has(tz) ? PROMINENCE_RANK.get(tz) : Number.MAX_SAFE_INTEGER;
}

let allZonesCache = null;
let searchIndexCache = null;

/** Every IANA zone the runtime knows about, canonical names only. */
function allZones() {
  if (allZonesCache) return allZonesCache;
  let zones;
  try {
    zones = Intl.supportedValuesOf('timeZone');
  } catch {
    zones = null;
  }
  if (!Array.isArray(zones) || zones.length === 0) zones = FALLBACK_ZONES;

  // Curated entries must always be selectable, but never list the same zone twice
  // under both its modern and legacy spelling.
  const set = new Set(zones);
  for (const group of ALIAS_GROUPS) {
    if (group.some((tz) => set.has(tz))) continue;
    set.add(group[0]);
  }
  for (const tz of Object.keys(META)) {
    if (!ALIAS_GROUPS.some((group) => group.includes(tz))) set.add(tz);
  }

  allZonesCache = [...set].sort((a, b) => a.localeCompare(b));
  return allZonesCache;
}

/**
 * `SH, China` for curated zones. Anything else still gets a readable label derived from
 * the IANA id itself -- the last segment names the place, and a middle segment (when
 * present) names the country or state:
 *   America/Argentina/Catamarca -> CAT, Argentina
 *   America/Detroit             -> DET, America
 *   Etc/GMT+8                   -> UTC-8
 */
function labelFor(tz) {
  const meta = META[tz];
  if (meta) return { code: meta.code, country: meta.country, city: meta.city || meta.code };

  const segments = tz.split('/');
  const raw = segments[segments.length - 1] || tz;
  const region = segments[0] || '';

  // Fixed-offset zones. The sign in the IANA id is inverted relative to the real offset
  // (`Etc/GMT+8` is UTC-8), so the raw name would be actively misleading -- show the
  // actual offset instead.
  if (region === 'Etc') {
    const match = /^GMT([+-])(\d{1,2})$/.exec(raw);
    const size = match ? Number(match[2]) : 0;
    const label =
      match && size !== 0 ? `UTC${match[1] === '+' ? '-' : '+'}${size}` : 'UTC';
    return { code: label, country: '', city: label };
  }

  const words = raw.split('_').filter(Boolean);

  // Multi-word names read best as initials (Port_of_Spain -> POS); a single word takes
  // its first three letters (Catamarca -> CAT) so the code is never a lone letter.
  const code = (words.length > 1 ? words.map((word) => word[0]).join('') : words[0] || raw)
    .toUpperCase()
    .slice(0, 3);

  return {
    code: code || tz.slice(0, 3).toUpperCase(),
    country: (segments.length > 2 ? segments[1] : region).replace(/_/g, ' '),
    city: raw.replace(/_/g, ' ')
  };
}

/** Lowercased haystack per zone, built once so typing stays responsive. */
function searchIndex() {
  if (searchIndexCache) return searchIndexCache;
  searchIndexCache = allZones().map((tz) => {
    const meta = META[tz];
    const parts = [tz, tz.replace(/[_/]/g, ' ')];
    if (meta) {
      parts.push(meta.code, meta.country, meta.city);
      if (COUNTRY_ZH[meta.country]) parts.push(COUNTRY_ZH[meta.country]);
      if (meta.aka) parts.push(...meta.aka);
    }
    return { tz, hay: parts.join(' ').toLowerCase() };
  });
  return searchIndexCache;
}

/**
 * Some countries run a single clock, so people search by a city the IANA id does not name
 * -- typing `frank` resolves to `Europe/Berlin`, whose row would otherwise just read
 * `柏林`, looking like a miss. When the query matched only an alias, hand back that alias
 * so the row can say which one it hit.
 */
function aliasHint(tz, q) {
  const meta = META[tz];
  if (!meta || !meta.aka) return '';

  const primary = [tz, meta.code, meta.country, meta.city, COUNTRY_ZH[meta.country]]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (primary.includes(q)) return '';

  return meta.aka.find((alias) => alias.toLowerCase().includes(q)) || '';
}

/**
 * Rank a zone against a query. Lower is better; 11 is the weakest match.
 *
 * Country and city names outrank loose substring hits on the IANA id, otherwise
 * "india" would surface America/Indiana/Knox ahead of Asia/Kolkata.
 */
function scoreOf(tz, query) {
  const meta = META[tz];
  const lower = tz.toLowerCase();
  const segments = lower.split('/');
  const last = (segments[segments.length - 1] || lower).replace(/_/g, ' ');
  const middle = segments.length > 2 ? segments[1].replace(/_/g, ' ') : '';
  const code = meta ? meta.code.toLowerCase() : '';
  const city = meta ? meta.city.toLowerCase() : '';
  const country = meta ? meta.country.toLowerCase() : '';
  const countryZh = meta ? COUNTRY_ZH[meta.country] || '' : '';

  if (lower === query) return 0;
  if (code && code === query) return 1;
  if (city && city === query) return 2;
  if (country && country === query) return 3;
  if (countryZh && countryZh === query) return 4;
  if (code && code.startsWith(query)) return 5;
  if (city && city.startsWith(query)) return 6;
  if (last === query) return 7;
  if (last.startsWith(query)) return 8;
  if (country && country.startsWith(query)) return 9;
  if (middle && middle.startsWith(query)) return 10;
  return 11;
}

/** Resolve a typed zone id to its canonical spelling, or null when it is not a zone. */
function canonicalZone(tz) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

/**
 * Search zones by IANA id, English city, Chinese city, airport-style code or country.
 *
 * A typed value that names a real zone but is missing from the picker is offered
 * directly: Chromium drops `Etc/*` and several sub-region zones (for example
 * `America/Argentina/Catamarca`) from `supportedValuesOf` even though `DateTimeFormat`
 * resolves them, so without this those zones would be unreachable.
 *
 * @returns {Array<{tz:string,label:object,score:number}>}
 */
function searchZones(query, limit = 8) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];

  const results = [];
  for (const entry of searchIndex()) {
    if (!entry.hay.includes(q)) continue;
    results.push({
      tz: entry.tz,
      label: labelFor(entry.tz),
      score: scoreOf(entry.tz, q),
      hint: aliasHint(entry.tz, q)
    });
  }
  results.sort(
    (a, b) =>
      a.score - b.score || prominence(a.tz) - prominence(b.tz) || a.tz.localeCompare(b.tz)
  );

  const top = results.slice(0, limit);

  if (q.includes('/')) {
    const canonical = canonicalZone(query.trim());
    if (canonical && !results.some((result) => result.tz === canonical)) {
      top.unshift({ tz: canonical, label: labelFor(canonical), score: -1 });
    }
  }

  return top.slice(0, limit);
}

/** Short Chinese display name for the panel's selected-zone list. */
function displayName(tz) {
  const meta = META[tz];
  if (meta) return meta.city || meta.code;
  return labelFor(tz).city;
}

const Zones = { META, PRESETS, COUNTRY_ZH, allZones, labelFor, searchZones, displayName };

if (typeof module !== 'undefined' && module.exports) module.exports = Zones;
if (typeof window !== 'undefined') window.Zones = Zones;
