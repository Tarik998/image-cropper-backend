const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Config',
  tableName: 'configs',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    logo_position: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    logo_scale: {
      type: 'float',
      nullable: false,
    },
    logo_image: {
      type: 'text',
      nullable: true,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      nullable: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
      nullable: true,
    },
  },
});
