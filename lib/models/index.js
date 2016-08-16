'use strict';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const DocsSchema = new Schema();

DocsSchema.add({
  docid      : { type: String, index: true }, // id документа
  mainTitle  : { type: String, index: true }, // название документа
  url        : String, // адрес pdf файла
  type       : { type: Number, index: true }, // 0 - документ, 1 - раздел, 2 - картинка
  title      : String, // заголовок раздела
  parent     : { type: String, index: true }, // номер родительского раздела
  content    : String, // конктент раздела
  page       : { type: String, index: true }, // страница картинки
  image      : Buffer, // base64
  created_at : Date, // дата создания записи
  updated_at : Date  // дата изменения записи
});

DocsSchema.index({
  title: 'text',
  content: 'text'
});

mongoose.model('Docs', DocsSchema);
