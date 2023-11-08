// hanzicards.js    -*- mode: javascript; coding: utf-8 -*-
// version 0.3.1
// Copyright (C) 2003 by Forrest Cahoon (hanziquiz@abstractfactory.org)
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

var Category = ["Simplified Hanzi", "Traditional Hanzi", "Pinyin", "English"];

var Qsel_default_index = 0;
var Asel_default_index = 2;

var Deck = [
  [
    //  ["暗", "暗", "àn", "dark"],
    //  ["北", "北", "běi", "north"],
    ["不", "不", "bù", "no"],
    //  ["茶", "茶", "chá", "tea"],
    //  ["长", "長", "cháng", "long"],
    //  ["车", "車", "chē", "vehicle"],
    //  ["橙", "橙", "chéng", "orange"],
    //  ["吃", "吃", "chī", "eat"],
    //  ["大", "大", "dà", "big"],
    ["的", "的", "de", "of (possessive particle)"],
    //  ["电", "電", "diàn", "electric"],
    //  ["东", "東", "dōng", "east"],
    //  ["短", "短", "duǎn", "short"],
    //  ["风", "風", "fēng", "wind"],
    //  ["狗", "狗", "gǒu", "dog"],
    //  ["好", "好", "hǎo", "good"],
    //  ["黑", "黑", "hēi", "black"],
    //  ["红", "紅", "hóng", "red"],
    //  ["坏", "壞", "huài", "bad, broken"],
    //  ["火", "火", "huǒ", "fire"],
    ["几", "幾", "jǐ", "how many?"],
    ["家", "家", "jiā", "family, home"],
    //  ["江", "江", "jiāng", "river"],
    ["叫", "叫", "jiào", "to be called"],
    //  ["看", "看", "kàn", "look"],
    //  ["蓝", "藍", "lán", "blue"],
    //  ["老", "老", "lǎo", "old"],
    //  ["雷", "雷", "léi", "thunder"],
    //  ["妈", "媽", "mā", "mother"],
    //  ["马", "馬", "mǎ", "horse"],
    ["吗", "嗎", "ma", "(question marker)"],
    //  ["猫", "貓", "māo", "cat"],
    ["没有", "沒有", "méi yǒu", "don't have"],
    //  ["门", "門", "mén", "door, gate"],
    //  ["明", "明", "míng", "bright"],
    //  ["南", "南", "nán", "south"],
    //  ["男", "男", "nán", "male"],
    //  ["能", "能", "néng", "to be able"],
    ["你", "你", "nǐ", "you"],
    ["年", "年", "nián", "year"],
    //  ["女", "女", "nǚ", "female"],
    ["去", "去", "qù", "to go"],
    //  ["人", "人", "rén", "person"],
    ["日", "日", "rì", "sun"],
    //  ["肉", "肉", "ròu", "meat, flesh"],
    //  ["山", "山", "shān", "hill, mountain"],
    //  ["上", "上", "shàng", "above, up, towards"],
    ["是", "是", "shì", "yes, is"],
    //  ["水", "水", "shuǐ", "water"],
    ["他", "他", "tā", "he, him"],
    //  ["她", "她", "tā", "she, her"],
    ["天", "天", "tiān", "day, sky, heaven"],
    ["我", "我", "wǒ", "I,me"],
    //  ["西", "西", "xī", "west"],
    //  ["下", "下", "xià", "down"],
    //  ["小", "小", "xiǎo", "small"],
    //  ["谢", "謝", "xiè", "thank"],
    //  ["心", "心", "xīn", "heart"],
    //  ["要", "要", "yào", "want"],
    ["有", "有", "yǒu", "have"],
    ["月", "月", "yuè", "moon, month"],
    //  ["再", "再", "zài", "again"],
    //  ["在", "在", "zài", "at"],
    //  ["中", "中", "zhōng", "middle"],
  ],
  [
    //  ["聪明", "聰明", "cōng míng", "intelligent"],
    //  ["电话", "電話", "diàn huà", "telephone"],
    //  ["电视", "電視", "diàn shì", "television"],
    //  ["东西", "東西", "dōng xī", "thing"],
    //  ["法国", "法國", "fǎ guó", "France"],
    //  ["房子", "房子", "fáng zi", "house, building"],
    //  ["非常", "非常", "fēi cháng", "extraordinary"],
    //  ["飞机", "飛機", "fēi jī", "airplane"],
    //  ["高兴", "高興", "gāo xìng", "happy"],
    //  ["公司", "公司", "gōng sī", "company, corporation"],
    //  ["公园", "公園", "gōng yuán", "park"],
    //  ["火车", "火車", "huǒ chē", "train"],
    //  ["结婚", "結婚", "jié hūn", "marry"],
    //  ["今天", "今天", "jīn tiān", "today"],
    //  ["咖啡", "咖啡", "kā fēi", "coffee"],
    //  ["老虎", "老虎", "lǎo hǔ", "tiger"],
    //  ["美国", "美國", "měi guó", "The United States"],
    //  ["明天", "明天", "míng tiān", "tomorrow"],
    //  ["漂亮", "漂亮", "piào liàng", "pretty, handsome"],
    //  ["苹果", "蘋果", "píng guǒ", "apple"],
    //  ["上班", "上班", "shàng bān", "go to work"],
    ["什么", "什麼", "shén me", "what?"],
    //  ["时间", "時間", "shí jiān", "time (n.]"],
    //  ["随便", "隨便", "suí biàn", "casual"],
    //  ["天气", "天氣", "tiān qì", "weather"],
    ["喜欢", "喜歡", "xǐ huān", "to like"],
    //  ["下班", "下班", "xià bān", "leave work"],
    //  ["现在", "現在", "xiàn zài", "now"],
    //  ["休息", "休息", "xiū xi", "rest (v.]"],
    ["学生", "學生", "xué shēng", "student"],
    //  ["英国", "英國", "yīng guó", "England"],
    //  ["中国", "中國", "zhōng guó", "China"],
    //  ["中文", "中文", "zhōng wén", "Chinese language"],
    //  ["昨天", "昨天", "zuó tiān", "yesterday"],
  ],
];
