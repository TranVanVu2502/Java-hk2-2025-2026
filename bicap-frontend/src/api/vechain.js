import { Connex } from '@vechain/connex';

const connex = new Connex({
    node: 'https://testnet.veblocks.net',
    network: 'test'
});

export const signExportToBlockchain = async (season) => {
    // 1. Tạo nội dung ghi lên Blockchain (Dạng mã hóa hoặc chuỗi định danh)
    const rawData = `BICAP-SEASON-ID:${season.seasonId}-NAME:${season.name}-TIME:${new Date().getTime()}`;
    const hexData = '0x' + Buffer.from(rawData).toString('hex');

    // 2. Tạo Clause
    const clause = {
        to: '0xC7d39cf7A0c412B43f86AE8cDa697A2727446658', // Ví của bạn
        value: '0x0',
        data: hexData
    };

    // 3. Yêu cầu ví VeWorld/Sync2 ký
    const result = await connex.vendor
        .sign('tx', [clause])
        .comment(`Xác nhận xuất mùa vụ: ${season.name}`)
        .request();

    return result.txid; // Đây chính là txId để gửi về BE
};