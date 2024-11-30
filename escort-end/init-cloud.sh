#!/bin/bash

# 云函数列表
FUNCTIONS=(
    "getOrders"
    "getOrderStats"
    "getIncomeList"
    "getIncomeStats"
    "getEscortInfo"
    "getWorkspaceStats"
    "updateOrderStatus"
    "updateEscortInfo"
)

# 创建基础 package.json
create_package_json() {
    local function_name=$1
    echo '{
  "name": "'$function_name'",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}' > $function_name/package.json
}

# 为每个云函数安装依赖
for func in "${FUNCTIONS[@]}"
do
    echo "Processing $func..."
    cd cloudfunctions/$func
    
    # 删除旧的依赖
    rm -rf node_modules
    rm -f package-lock.json
    
    # 创建新的 package.json
    create_package_json $func
    
    # 安装依赖
    npm install
    
    cd ../..
    echo "Completed $func"
done

echo "All functions processed!" 