/**
 * Package Management Models
 * Export all package-related models and define associations
 */

const { HrmsPackage } = require('./HrmsPackage');
const { HrmsModule } = require('./HrmsModule');
const { HrmsPackageModule } = require('./HrmsPackageModule');
const { HrmsCompanyPackage } = require('./HrmsCompanyPackage');
const { HrmsCompanyAddonModule } = require('./HrmsCompanyAddonModule');

// Define associations

// Package <-> Modules (Many-to-Many through HrmsPackageModule)
HrmsPackage.belongsToMany(HrmsModule, {
    through: HrmsPackageModule,
    foreignKey: 'package_id',
    otherKey: 'module_id',
    as: 'modules'
});

HrmsModule.belongsToMany(HrmsPackage, {
    through: HrmsPackageModule,
    foreignKey: 'module_id',
    otherKey: 'package_id',
    as: 'packages'
});

// Direct access to junction table
HrmsPackage.hasMany(HrmsPackageModule, { foreignKey: 'package_id', as: 'packageModules' });
HrmsModule.hasMany(HrmsPackageModule, { foreignKey: 'module_id', as: 'modulePackages' });
HrmsPackageModule.belongsTo(HrmsPackage, { foreignKey: 'package_id', as: 'package' });
HrmsPackageModule.belongsTo(HrmsModule, { foreignKey: 'module_id', as: 'module' });

// Package <-> Company (One-to-Many through HrmsCompanyPackage)
HrmsPackage.hasMany(HrmsCompanyPackage, { foreignKey: 'package_id', as: 'companyPackages' });
HrmsCompanyPackage.belongsTo(HrmsPackage, { foreignKey: 'package_id', as: 'package' });

// Company Add-on Modules (Direct module access)
HrmsModule.hasMany(HrmsCompanyAddonModule, { foreignKey: 'module_id', as: 'companyAddons' });
HrmsCompanyAddonModule.belongsTo(HrmsModule, { foreignKey: 'module_id', as: 'module' });

module.exports = {
    HrmsPackage,
    HrmsModule,
    HrmsPackageModule,
    HrmsCompanyPackage,
    HrmsCompanyAddonModule
};
