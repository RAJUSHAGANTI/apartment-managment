const BaseRepository = require('./base.repository');

class BlockRepository extends BaseRepository {
  constructor() {
    super('blocks');
  }
}

module.exports = new BlockRepository();
