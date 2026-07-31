const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const injection = `
           var newKey = k.charAt(0).toLowerCase() + k.slice(1);
           if (k === 'ProductID' || k === 'InventoryID') newKey = 'id';
           else if (k === 'Category') newKey = 'itemType';
           mappedItem[newKey] = item[k];
        }
        return mappedItem;
`;

const replacement = `
           var newKey = k.charAt(0).toLowerCase() + k.slice(1);
           if (k === 'ProductID' || k === 'InventoryID') newKey = 'id';
           else if (k === 'Category') newKey = 'itemType';
           else if (k === 'Qty') newKey = 'quantity';
           else if (k === 'UnitPrice') newKey = 'sellingPrice';
           else if (k === 'Total') newKey = 'finalAmount';
           else if (k === 'Model') newKey = 'modelNumber';
           else if (k === 'LensType') newKey = 'lensCategory';
           mappedItem[newKey] = item[k];
        }
        return mappedItem;
`;

if (code.includes(injection)) {
  code = code.replace(injection, replacement);
  fs.writeFileSync('Code.gs', code);
  console.log("Success get keys");
} else {
  console.log("Injection not found");
}
