module.exports = {
   extends: [ '@silvermine/eslint-config/node' ],

   rules: {
      // I need to turn these off in order to override the Promise object
      'no-global-assign': 'off',
      'no-native-reassign': 'off',
   },
};
