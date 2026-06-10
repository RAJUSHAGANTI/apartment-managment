const BaseRepository = require('./base.repository');

class AmenityRepository extends BaseRepository {
  constructor() {
    super('amenities');
  }
}

module.exports = new AmenityRepository();
