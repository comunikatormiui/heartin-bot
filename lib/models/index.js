'use strict';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ContentSchema = new Schema();

ContentSchema.add({
  title      : String, // свойство
  parent     : { type: String, index: true }, // значение свойства
  text       : String, // текст раздела
  created_at : Date, // дата создания
  updated_at : Date // дата изменения
});

ContentSchema.index({
  title: 'text',
  text: 'text'
});

const ImagesSchema = new Schema();

ImagesSchema.add({
  page       : { type: String, index: true }, // страница
  image      : Buffer, // base64
  created_at : Date, // дата создания
  updated_at : Date // дата изменения
});

const DocsSchema = new Schema();

DocsSchema.add({
  docid      : { type: String, unique: true }, // id документа
  title      : { type: String, index: true }, // название документа
  url        : String, // адрес pdf файла
  content    : [ContentSchema], // конктент
  images     : [ImagesSchema], // картинки
  created_at : Date, // дата создания записи
  updated_at : Date  // дата изменения записи
});

DocsSchema.index({
  title: 'text'
});

mongoose.model('Docs', DocsSchema);
