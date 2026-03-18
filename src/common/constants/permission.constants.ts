export const PermissionCode = {
    SYSTEM_USER_LIST: 'system:user:list',
    SYSTEM_USER_ADD: 'system:user:add',
    SYSTEM_USER_UPDATE: 'system:user:update',
    SYSTEM_USER_DELETE: 'system:user:delete',
    SYSTEM_USER_ASSIGN_ROLE: 'system:user:assign-role',

    SYSTEM_ROLE_LIST: 'system:role:list',
    SYSTEM_ROLE_ADD: 'system:role:add',
    SYSTEM_ROLE_UPDATE: 'system:role:update',
    SYSTEM_ROLE_DELETE: 'system:role:delete',
    SYSTEM_ROLE_ASSIGN_PERMISSION: 'system:role:assign-permission',

    SYSTEM_PERMISSION_LIST: 'system:permission:list',
    SYSTEM_PERMISSION_ADD: 'system:permission:add',
    SYSTEM_PERMISSION_UPDATE: 'system:permission:update',
    SYSTEM_PERMISSION_DELETE: 'system:permission:delete',

    SYSTEM_OPERATION_LOG_LIST: 'system:operation-log:list',

    FOOD_CATEGORY_LIST: 'food:category:list',
    FOOD_CATEGORY_DETAIL: 'food:category:detail',
    FOOD_CATEGORY_ADD: 'food:category:add',
    FOOD_CATEGORY_UPDATE: 'food:category:update',
    FOOD_CATEGORY_UPDATE_STATUS: 'food:category:update-status',
    FOOD_CATEGORY_DELETE: 'food:category:delete',

    FOOD_ITEM_LIST: 'food:item:list',
    FOOD_ITEM_DETAIL: 'food:item:detail',
    FOOD_ITEM_ADD: 'food:item:add',
    FOOD_ITEM_UPDATE: 'food:item:update',
    FOOD_ITEM_UPDATE_ON_SALE: 'food:item:update-on-sale',
    FOOD_ITEM_UPDATE_STOCK: 'food:item:update-stock',
    FOOD_ITEM_DELETE: 'food:item:delete',

    FOOD_ORDER_LIST: 'food:order:list',
    FOOD_ORDER_DETAIL: 'food:order:detail',
    FOOD_ORDER_ADD: 'food:order:add',
    FOOD_ORDER_PROCESS: 'food:order:process',
    FOOD_ORDER_CANCEL: 'food:order:cancel',
    FOOD_ORDER_COMPLETE: 'food:order:complete',
} as const
