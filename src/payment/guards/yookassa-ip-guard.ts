/****************************************************************************************
 * Проверяем, что IP отправителя принадлежит официальным диапазонам ЮKassa
 * (IPv4/IPv6, CIDR и одиночные IP).
 ****************************************************************************************/

const ipRangeCheck = require("ip-range-check");

const ALLOWED_NETS = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.128/25',
  '2a02:5180::/32',
];

export const isIpAllowed = (remoteIP: string): boolean =>
  ipRangeCheck(remoteIP, ALLOWED_NETS);
