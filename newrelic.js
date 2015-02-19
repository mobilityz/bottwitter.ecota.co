/**
* New Relic agent configuration.
*
* See lib/config.defaults.js in the agent distribution for a more complete
* description of configuration variables and their potential values.
*/
exports.config = {
  /**
  * Array of application names.
  */
  app_name : ['EcoTa.co Twitter Bot'],
  /**
  * Your New Relic license key.
  */
  license_key : '5bd3cef4932c8cc346006131aa35369052b23ce2',
  logging : {
    /**
    * Level at which to log. 'trace' is most useful to New Relic when diagnosing
    * issues with the agent, 'info' and higher will impose the least overhead on
    * production applications.
    */
    level : 'info'
  }
};
