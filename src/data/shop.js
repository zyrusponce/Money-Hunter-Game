export const SHOP = [
  {id:'detector_range',name:'Better Money Detector',category:'Tools',icon:'⌁',price:250,description:'Extends the detector range by 20%.'},
  {id:'rare_scanner',name:'Rare Signal Scanner',category:'Upgrades',icon:'◈',price:350,description:'Rare and better signals reach 25% farther.'},
  {id:'treasure_radar',name:'Treasure Radar',category:'Tools',icon:'▣',price:400,description:'Sense chests nearby. Follow the signal to explore.'},
  {id:'map_upgrade',name:'Exploration Map Upgrade',category:'Upgrades',icon:'▧',price:200,description:'Reveal one extra tile and show landmarks on visited maps.'},
  {id:'forest_outfit',name:'Forest Explorer Outfit',category:'Cosmetics',slot:'outfit',color:'#55a879',icon:'♟',price:150,description:'A pine-green coat for the curious explorer.'},
  {id:'ocean_outfit',name:'Ocean Explorer Outfit',category:'Cosmetics',slot:'outfit',color:'#4c8dff',icon:'♟',price:150,description:'A blue coat inspired by the open sea.'},
  {id:'sunset_pack',name:'Sunset Backpack',category:'Cosmetics',slot:'backpack',color:'#e98653',icon:'▣',price:100,description:'Bring a little sunshine along the trail.'},
  {id:'silver_detector',name:'Silver Detector',category:'Cosmetics',slot:'detector',color:'#b8c2cc',icon:'⌁',price:100,description:'A polished silver finish for your trusty detector.'},
  {id:'coastal_map',name:'Tideworn Treasure Map',category:'Special Items',icon:'▧',price:125,description:'A clue to a secret along the beach.',item:'coastal_map'},
];
export const COSMETICS = Object.fromEntries(SHOP.filter(i=>i.slot).map(i=>[i.id,i]));
Object.assign(COSMETICS, {
  collection_outfit:{id:'collection_outfit',name:'Collector Outfit',slot:'outfit',color:'#ab7bd2'},
  explorer_outfit:{id:'explorer_outfit',name:'World Explorer Outfit',slot:'outfit',color:'#739f6c'},
  ancient_explorer:{id:'ancient_explorer',name:'Ancient Explorer Outfit',slot:'outfit',color:'#bc9352'},
  master_outfit:{id:'master_outfit',name:'Master Explorer Outfit',slot:'outfit',color:'#f5c542'},
  golden_detector:{id:'golden_detector',name:'Golden Money Detector',slot:'detector',color:'#f5c542'},
});
