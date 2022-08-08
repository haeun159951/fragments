// Use https://www.npmjs.com/package/nanoid to create unique IDs
const { nanoid } = require('nanoid');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');
const sharp = require('sharp');
const md = require('markdown-it')({
  html: true,
});

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const allSupportedTypes = [
  'text/plain',
  'text/plain; charset=utf-8',
  'text/markdown',
  'text/html',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (id) {
      this.id = id;
    } else {
      this.id = nanoid();
    }
    if (ownerId) {
      this.ownerId = ownerId;
    } else {
      throw new Error('ownerId is required');
    }
    if (Fragment.isSupportedType(type)) {
      this.type = type;
    } else {
      throw new Error('Type should be simple media type and can include a charset');
    }
    if (size >= 0 && typeof size === 'number') {
      this.size = size;
    } else {
      throw new Error('Size must be a number or can be 0 and cant be negative');
    }

    if ((created, updated)) {
      this.created = created;
      this.updated = updated;
    } else {
      this.created = new Date().toISOString();
      this.updated = new Date().toISOString();
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    try {
      return await listFragments(ownerId, expand);
    } catch (error) {
      logger.error({ error }, 'Error from byUser');
      return [];
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    try {
      logger.info(`fragment by id - ${id}`);
      return new Fragment(await readFragment(ownerId, id));
    } catch (error) {
      logger.error({ error }, 'Error by id');
      throw new Error(error);
    }
  }
  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    logger.info({ ownerId, id }, 'fragment data and metadata for the given id deleted');
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (Buffer.isBuffer(data)) {
      logger.info({ data }, 'fragment data');
      try {
        this.size = data.length;
        this.save();
        return writeFragmentData(this.ownerId, this.id, data);
      } catch (error) {
        logger.error({ error }, 'Error from set data');
        throw new Error(error);
      }
    } else {
      throw new Error('fragment data has an error');
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.includes('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.mimeType === 'text/plain') {
      return ['text/plain'];
    } else if (this.mimeType === 'text/markdown') {
      return ['text/plain', 'text/markdown', 'text/html'];
    } else if (this.mimeType === 'text/html') {
      return ['text/plain', 'text/html'];
    } else if (this.mimeType === 'application/json') {
      return ['text/plain', 'application/json'];
    } else {
      return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    }
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    logger.debug('isSupportedType: ' + value);
    let result;
    if (allSupportedTypes.includes(value)) {
      result = true;
    } else {
      result = false;
    }
    return result;
  }

  async convertType(data, ext) {
    if (!this.formats.includes(ext)) {
      return false;
    }
    let result = data;
    if (this.type === 'text/markdown' && ext === 'text/html') {
      result = md.render(data.toString());
      result = Buffer.from(result);
    } else if (ext === 'image/jpeg') {
      result = await sharp(data).jpeg().toBuffer();
    } else if (ext === 'image/png') {
      result = await sharp(data).png().toBuffer();
    } else if (ext === 'image/webp') {
      result = await sharp(data).webp().toBuffer();
    } else if (ext === 'image/gif') {
      result = await sharp(data).gif().toBuffer();
    }
    return result;
  }
}

module.exports.Fragment = Fragment;
