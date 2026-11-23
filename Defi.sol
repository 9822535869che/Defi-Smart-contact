// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  RentalEscrow — DeFi Rent
 * @notice สัญญาหลักของระบบยืม-ปล่อยเช่าสิ่งของแบบกระจายศูนย์
 *         เก็บทุกธุรกรรมไว้บนเชน: สัญญาเช่า เงินมัดจำ เงินประกัน ข้อพิพาท และคำตัดสิน
 *
 *  แยกอำนาจ 3 ฝ่าย (ตรงกับ role ในหน้าเว็บ)
 *    - ผู้ใช้ทั่วไป : ลงของ · ยืม · คืน · เปิดข้อพิพาท
 *    - ผู้พิพาท     : ลงรับเคส · ตัดสิน · รับค่าตอบแทน      (เป็นคู่สัญญาเช่าไม่ได้)
 *    - Admin        : ตั้งกฎ · อนุมัติผู้พิพาท · ริบประกัน · pause (ตัดสินเองไม่ได้)
 *
 *  สิ่งที่ "ไม่" เก็บบนเชนโดยเจตนา
 *    - รูปหลักฐาน  : อัปโหลดขึ้น IPFS แล้วเก็บเฉพาะ CID (รูปบนเชนแพงมหาศาล)
 *    - รายการโปรด  : ความชอบส่วนตัว ไม่ใช่ข้อตกลงทางการเงิน เก็บนอกเชน
 *    - ข้อความยาว  : เหตุผลข้อพิพาทเก็บเป็น URI ชี้ไป IPFS
 */
contract Defi {
    /* ─────────────────────────── ประเภทข้อมูล ─────────────────────────── */

    enum ItemStatus   { Available, Borrowed, Inspecting, Delisted }
    enum RentalStatus { Active, Returned, Completed, Disputed, Resolved }
    enum Outcome      { None, Renter, Lender }   // ตัดสินให้ผู้เช่า / ผู้ปล่อยเช่า

    struct Item {
        address lender;        // เจ้าของสิ่งของ
        bytes32 categoryId;    // หมวดหมู่ (Admin เป็นผู้กำหนดรายการ)
        uint128 pricePerDay;   // ค่าเช่าต่อวัน (wei)
        uint128 deposit;       // เงินมัดจำที่ผู้เช่าต้องวาง
        uint128 bond;          // เงินประกันของผู้ปล่อยเช่า (ล็อกตั้งแต่ลงของ)
        uint32  maxDays;       // ระยะเวลาให้ยืมสูงสุด
        bool    allowRent;     // เจ้าของเปิดให้เช่าหรือไม่
        ItemStatus status;
        string  metaURI;       // IPFS: ชื่อ รายละเอียด รูปสินค้า
    }

    struct Rental {
        uint256 itemId;
        address renter;
        address lender;
        uint128 rent;          // ค่าเช่ารวมทั้งสัญญา
        uint128 deposit;       // มัดจำที่ล็อกไว้
        uint128 bond;          // เงินประกันผู้ปล่อยเช่าที่ล็อกไว้
        uint128 fee;           // ค่าธรรมเนียมแพลตฟอร์ม (หักจากฝั่งผู้ปล่อยเช่า)
        uint64  startAt;
        uint64  dueAt;
        uint64  returnedAt;    // เวลาที่ผู้เช่ากดคืน (0 = ยังไม่คืน)
        RentalStatus status;
    }

    struct Dispute {
        uint256 rentalId;
        address opener;        // ผู้ยื่น (เป็นผู้เช่าหรือผู้ปล่อยเช่าก็ได้)
        address renter;        // ฝั่งผู้เช่าของสัญญานี้
        address lender;        // ฝั่งผู้ปล่อยเช่าของสัญญานี้
        address arbitrator;    // ผู้พิพาทที่ลงรับเคส (0 = ยังไม่มีใครรับ)
        uint64  openedAt;
        uint64  claimedAt;     // ใช้นับกรอบเวลาพิจารณา 48 ชม.
        uint64  closedAt;
        Outcome outcome;
        uint128 cut;           // จำนวนเงินที่หัก ผู้พิพาทปรับได้ตามความเหมาะสม
        uint8   problemType;   // รหัสประเภทปัญหา (ตรงกับดรอปดาวน์ในหน้าเว็บ)
        string  reasonURI;     // IPFS: คำอธิบาย + รูปหลักฐาน
        bool    resolved;
    }

    /// ผลการแบ่งเงินหลังตัดสิน — รวมเป็นโครงเดียวเพื่อลดภาระ stack
    struct Payout { uint256 toRenter; uint256 toLender; uint256 fee; }

    struct Application { address applicant; uint128 stake; uint64 at; string profileURI; bool open; }
    struct ExitRequest { address arbitrator; uint64 at; uint8 reason; bool open; }

    /* ─────────────────────────── สถานะระบบ ─────────────────────────── */

    address public owner;                       // Admin / เจ้าของสัญญา
    bool    public paused;                      // circuit breaker
    bool    public applicationsOpen = true;

    uint16  public feeBps     = 250;            // 2.50%  (10000 = 100%)
    uint256 public minStake   = 5 ether;        // เงินประกันขั้นต่ำของผู้พิพาท
    uint256 public arbReward  = 0.15 ether;     // ค่าตอบแทนต่อเคส

    uint16  public constant MAX_FEE_BPS    = 1000;    // เพดานค่าธรรมเนียม 10%
    uint64  public constant INSPECT_WINDOW = 3 days;  // เวลาตรวจสภาพของหลังคืน
    uint64  public constant JUDGE_SLA      = 48 hours;// กรอบเวลาพิจารณาเคส

    uint256 public treasury;                    // ค่าธรรมเนียม + เงินที่ริบ
    uint256 public rewardPaid;                  // ค่าตอบแทนที่จ่ายผู้พิพาทสะสม

    Item[]     public items;
    Rental[]   public rentals;
    Dispute[]  public disputes;

    mapping(uint256 => uint256) public activeRentalOf;  // itemId => rentalId+1
    mapping(uint256 => uint256) public disputeOfRental; // rentalId => disputeId+1

    // ผู้พิพาท
    mapping(address => bool)    public isArbitrator;
    mapping(address => uint256) public stakeOf;
    mapping(address => uint256) public casesClosed;
    mapping(address => uint256) public earnedOf;
    mapping(address => uint16)  public repOf;           // เครดิต 0-100
    address[] public arbitrators;
    mapping(address => uint256) private arbIndex;       // index+1

    Application[] public applications;
    mapping(address => uint256) public applicationOf;   // index+1
    ExitRequest[] public exitRequests;
    mapping(address => uint256) public exitRequestOf;   // index+1

    // หมวดหมู่ (Admin เพิ่ม/ลบได้ จากการ์ด + ในหน้าแรก)
    mapping(bytes32 => bool) public categoryExists;
    mapping(bytes32 => uint256) public itemsInCategory;
    bytes32[] public categories;

    /**
     * จ่ายเงินแบบ pull payment ทุกกรณี — ไม่ส่ง ETH ตรงระหว่างทำงาน
     * กันทั้ง reentrancy และกรณีปลายทางเป็นสัญญาที่รับ ETH ไม่ได้แล้วทำให้ทั้งธุรกรรมล้ม
     */
    mapping(address => uint256) public pendingWithdrawal;

    /* ─────────────────────────── เหตุการณ์ ─────────────────────────── */
    // หน้าเว็บสร้างรายการใน Transaction History จาก event เหล่านี้ทั้งหมด

    event CategoryAdded(bytes32 indexed id, string name);
    event CategoryRemoved(bytes32 indexed id);

    event ItemListed(uint256 indexed itemId, address indexed lender, bytes32 indexed category, uint256 pricePerDay, uint256 deposit, uint256 bond);
    event ItemAvailabilityChanged(uint256 indexed itemId, bool allowRent);
    event ItemDelisted(uint256 indexed itemId, uint256 bondReturned);

    event Borrowed(uint256 indexed rentalId, uint256 indexed itemId, address indexed renter, uint256 rent, uint256 deposit, uint256 dueAt);
    event Returned(uint256 indexed rentalId, address indexed renter, uint256 at);
    event ReturnAccepted(uint256 indexed rentalId, address indexed lender, uint256 toRenter, uint256 toLender, uint256 fee);
    event AutoReleased(uint256 indexed rentalId, uint256 toRenter, uint256 toLender, uint256 fee);

    event DisputeOpened(uint256 indexed disputeId, uint256 indexed rentalId, address indexed opener, uint8 problemType, string reasonURI);
    event CaseClaimed(uint256 indexed disputeId, address indexed arbitrator, uint256 at);
    event CaseReleased(uint256 indexed disputeId, address indexed formerArbitrator, string why);
    event Judged(uint256 indexed disputeId, address indexed arbitrator, Outcome outcome, uint256 cut, uint256 toRenter, uint256 toLender, uint256 fee);

    event ApplicationSubmitted(uint256 indexed appId, address indexed applicant, uint256 stake);
    event ApplicationApproved(uint256 indexed appId, address indexed arbitrator);
    event ApplicationRejected(uint256 indexed appId, address indexed applicant, uint256 refunded);
    event StakeAdded(address indexed arbitrator, uint256 amount, uint256 total);
    event StakeSlashed(address indexed arbitrator, uint256 amount, uint256 remaining, uint8 reason);
    event ExitRequested(uint256 indexed exitId, address indexed arbitrator, uint8 reason);
    event ExitCancelled(uint256 indexed exitId, address indexed arbitrator);
    event ExitApproved(uint256 indexed exitId, address indexed arbitrator, uint256 stakeReturned);
    event ExitRejected(uint256 indexed exitId, address indexed arbitrator);
    event ArbitratorRevoked(address indexed arbitrator, uint256 stakeReturned, uint256 casesReleased);
    event RewardPaid(address indexed arbitrator, uint256 indexed disputeId, uint256 amount);

    event FeeChanged(uint16 oldBps, uint16 newBps);
    event MinStakeChanged(uint256 oldValue, uint256 newValue);
    event RewardChanged(uint256 oldValue, uint256 newValue);
    event ApplicationsOpenChanged(bool open);
    event PausedChanged(bool paused);
    event Withdrawn(address indexed to, uint256 amount);
    event TreasuryWithdrawn(address indexed to, uint256 amount);

    /* ─────────────────────────── ตัวกรองสิทธิ์ ─────────────────────────── */

    modifier onlyOwner() { require(msg.sender == owner, "ADMIN_ONLY"); _; }
    modifier notPaused() { require(!paused, "PAUSED"); _; }

    /// ผู้พิพาทที่ใช้งานได้ = ได้รับอนุมัติแล้ว และเงินประกันไม่ต่ำกว่าเกณฑ์
    modifier onlyActiveArbitrator() {
        require(isArbitrator[msg.sender], "NOT_ARBITRATOR");
        require(stakeOf[msg.sender] >= minStake, "STAKE_TOO_LOW");
        _;
    }

    /// แยกอำนาจ: Admin และผู้พิพาทไม่เป็นคู่สัญญาเช่า
    modifier onlyRenterRole() {
        require(msg.sender != owner, "ADMIN_CANNOT_RENT");
        require(!isArbitrator[msg.sender], "ARBITRATOR_CANNOT_RENT");
        _;
    }

    constructor() {
        owner = msg.sender;
        _addCategory("electronics");
        _addCategory("sports");
        _addCategory("lifestyle");
        _addCategory("books");
        _addCategory("tools");
    }

    /* ═══════════════════════ 1. หมวดหมู่ (Admin) ═══════════════════════ */

    function addCategory(string calldata name) external onlyOwner {
        _addCategory(name);
    }

    function _addCategory(string memory name) internal {
        bytes32 id = keccak256(bytes(name));
        require(!categoryExists[id], "CATEGORY_EXISTS");
        categoryExists[id] = true;
        categories.push(id);
        emit CategoryAdded(id, name);
    }

    /// ลบได้เฉพาะหมวดที่ไม่มีสิ่งของค้างอยู่ กันของกลายเป็นกำพร้า
    function removeCategory(bytes32 id) external onlyOwner {
        require(categoryExists[id], "NO_CATEGORY");
        require(itemsInCategory[id] == 0, "CATEGORY_IN_USE");
        categoryExists[id] = false;
        for (uint256 i = 0; i < categories.length; i++) {
            if (categories[i] == id) {
                categories[i] = categories[categories.length - 1];
                categories.pop();
                break;
            }
        }
        emit CategoryRemoved(id);
    }

    function categoryCount() external view returns (uint256) { return categories.length; }

    /* ═══════════════════════ 2. สิ่งของ ═══════════════════════ */

    /// @notice ลงทะเบียนสิ่งของ ต้องส่งเงินประกันของผู้ปล่อยเช่ามาล็อกพร้อมกัน
    function listItem(
        bytes32 categoryId,
        uint128 pricePerDay,
        uint32  maxDays,
        uint128 deposit,
        uint128 bond,
        bool    allowRent,
        string calldata metaURI
    ) external payable notPaused onlyRenterRole returns (uint256 itemId) {
        require(categoryExists[categoryId], "NO_CATEGORY");
        require(maxDays > 0 && maxDays <= 365, "BAD_DAYS");
        require(msg.value == bond, "SEND_BOND");

        items.push(Item({
            lender: msg.sender, categoryId: categoryId,
            pricePerDay: pricePerDay, deposit: deposit, bond: bond,
            maxDays: maxDays, allowRent: allowRent,
            status: ItemStatus.Available, metaURI: metaURI
        }));
        itemId = items.length - 1;
        itemsInCategory[categoryId]++;
        emit ItemListed(itemId, msg.sender, categoryId, pricePerDay, deposit, bond);
    }

    function setAvailability(uint256 itemId, bool allowRent) external {
        Item storage it = items[itemId];
        require(it.lender == msg.sender, "NOT_OWNER");
        require(it.status == ItemStatus.Available, "ITEM_BUSY");
        it.allowRent = allowRent;
        emit ItemAvailabilityChanged(itemId, allowRent);
    }

    /// ถอนของออกจากระบบและรับเงินประกันคืน ทำได้เมื่อไม่มีสัญญาค้าง
    function delistItem(uint256 itemId) external {
        Item storage it = items[itemId];
        require(it.lender == msg.sender, "NOT_OWNER");
        require(it.status == ItemStatus.Available, "ITEM_BUSY");
        it.status = ItemStatus.Delisted;
        itemsInCategory[it.categoryId]--;
        uint256 back = it.bond;
        it.bond = 0;
        _credit(msg.sender, back);
        emit ItemDelisted(itemId, back);
    }

    function itemCount() external view returns (uint256) { return items.length; }

    /* ═══════════════════════ 3. วงจรเช่า ═══════════════════════ */

    /// @notice ทำสัญญาเช่า ส่งมาพร้อม ค่าเช่า + เงินมัดจำ
    function borrow(uint256 itemId, uint32 daysCount)
        external payable notPaused onlyRenterRole returns (uint256 rentalId)
    {
        Item storage it = items[itemId];
        require(it.status == ItemStatus.Available, "NOT_AVAILABLE");
        require(it.allowRent, "RENT_DISABLED");
        require(it.lender != msg.sender, "OWN_ITEM");
        require(daysCount > 0 && daysCount <= it.maxDays, "BAD_DAYS");

        require(msg.value == uint256(it.pricePerDay) * daysCount + it.deposit, "BAD_AMOUNT");

        rentalId = _openRental(itemId, daysCount);
        it.status = ItemStatus.Borrowed;
        activeRentalOf[itemId] = rentalId + 1;

        emit Borrowed(rentalId, itemId, msg.sender,
                      rentals[rentalId].rent, rentals[rentalId].deposit, rentals[rentalId].dueAt);
    }

    /// สร้างสัญญาเช่าและล็อกยอดทุกก้อนไว้ในสัญญา
    function _openRental(uint256 itemId, uint32 daysCount) internal returns (uint256) {
        Item storage it = items[itemId];
        uint128 rent = uint128(uint256(it.pricePerDay) * daysCount);
        rentals.push(Rental({
            itemId: itemId, renter: msg.sender, lender: it.lender,
            rent: rent, deposit: it.deposit, bond: it.bond,
            fee: uint128((uint256(rent) * feeBps) / 10000),
            startAt: uint64(block.timestamp),
            dueAt:   uint64(block.timestamp + uint256(daysCount) * 1 days),
            returnedAt: 0, status: RentalStatus.Active
        }));
        return rentals.length - 1;
    }

    /// @notice ผู้เช่าส่งคืนของ — ยังไม่ปล่อยเงิน ต้องรอผู้ปล่อยเช่าตรวจสภาพก่อน
    function returnItem(uint256 rentalId) external notPaused {
        Rental storage r = rentals[rentalId];
        require(r.renter == msg.sender, "NOT_RENTER");
        require(r.status == RentalStatus.Active, "BAD_STATE");
        r.status = RentalStatus.Returned;
        r.returnedAt = uint64(block.timestamp);
        items[r.itemId].status = ItemStatus.Inspecting;
        emit Returned(rentalId, msg.sender, block.timestamp);
    }

    /// @notice ผู้ปล่อยเช่าตรวจแล้วของอยู่ในสภาพดี — ปิดสัญญาและปล่อยเงินทุกฝั่ง
    function acceptReturn(uint256 rentalId) external notPaused {
        Rental storage r = rentals[rentalId];
        require(r.lender == msg.sender, "NOT_LENDER");
        require(r.status == RentalStatus.Returned, "BAD_STATE");
        (uint256 toRenter, uint256 toLender, uint256 fee) = _closeNormally(rentalId);
        emit ReturnAccepted(rentalId, msg.sender, toRenter, toLender, fee);
    }

    /**
     * @notice ผู้ปล่อยเช่าไม่ตรวจภายใน 3 วัน ผู้เช่าเรียกปล่อยเงินเองได้
     *         กันไม่ให้มัดจำถูกจับเป็นตัวประกันด้วยการเงียบ
     */
    function claimAfterInspectWindow(uint256 rentalId) external notPaused {
        Rental storage r = rentals[rentalId];
        require(r.renter == msg.sender, "NOT_RENTER");
        require(r.status == RentalStatus.Returned, "BAD_STATE");
        require(block.timestamp >= r.returnedAt + INSPECT_WINDOW, "WINDOW_OPEN");
        (uint256 toRenter, uint256 toLender, uint256 fee) = _closeNormally(rentalId);
        emit AutoReleased(rentalId, toRenter, toLender, fee);
    }

    /// ปิดสัญญาแบบไม่มีข้อพิพาท: ผู้เช่าได้มัดจำคืน · ผู้ปล่อยเช่าได้ค่าเช่า - ค่าธรรมเนียม + เงินประกัน
    function _closeNormally(uint256 rentalId)
        internal returns (uint256 toRenter, uint256 toLender, uint256 fee)
    {
        Rental storage r = rentals[rentalId];
        fee      = r.fee;
        toRenter = r.deposit;
        toLender = uint256(r.rent) + r.bond - fee;

        r.status = RentalStatus.Completed;
        Item storage it = items[r.itemId];
        it.status = ItemStatus.Available;
        activeRentalOf[r.itemId] = 0;

        treasury += fee;
        _credit(r.renter, toRenter);
        _credit(r.lender, toLender);
    }

    /* ═══════════════════════ 4. ข้อพิพาท ═══════════════════════ */

    /**
     * @notice เปิดข้อพิพาท — เปิดได้เฉพาะคู่สัญญาของรายการนั้นเท่านั้น
     * @param reasonURI  IPFS CID ของคำอธิบายและรูปหลักฐาน
     */
    function openDispute(uint256 rentalId, uint8 problemType, string calldata reasonURI)
        external notPaused returns (uint256 disputeId)
    {
        Rental storage r = rentals[rentalId];
        require(msg.sender == r.renter || msg.sender == r.lender, "NOT_A_PARTY");
        require(r.status == RentalStatus.Active || r.status == RentalStatus.Returned, "BAD_STATE");
        require(disputeOfRental[rentalId] == 0, "ALREADY_DISPUTED");

        disputes.push(Dispute({
            rentalId: rentalId, opener: msg.sender,
            renter: r.renter, lender: r.lender, arbitrator: address(0),
            openedAt: uint64(block.timestamp), claimedAt: 0, closedAt: 0,
            outcome: Outcome.None, cut: 0, problemType: problemType,
            reasonURI: reasonURI, resolved: false
        }));
        disputeId = disputes.length - 1;
        disputeOfRental[rentalId] = disputeId + 1;
        r.status = RentalStatus.Disputed;
        emit DisputeOpened(disputeId, rentalId, msg.sender, problemType, reasonURI);
    }

    /**
     * @notice ผู้พิพาทลงรับเคส — 1 เคสมีผู้พิพาทได้คนเดียว
     * @dev    กันผลประโยชน์ทับซ้อน: คู่กรณีของเคสรับเคสตัวเองไม่ได้ทุกกรณี
     */
    function claimCase(uint256 disputeId) external notPaused onlyActiveArbitrator {
        Dispute storage d = disputes[disputeId];
        require(d.arbitrator == address(0), "ALREADY_CLAIMED");
        require(!d.resolved, "CLOSED");
        require(msg.sender != d.renter && msg.sender != d.lender, "CONFLICT_OF_INTEREST");
        require(exitRequestOf[msg.sender] == 0, "EXIT_PENDING");

        d.arbitrator = msg.sender;
        d.claimedAt  = uint64(block.timestamp);
        emit CaseClaimed(disputeId, msg.sender, block.timestamp);
    }

    /// เพดานเงินที่หักได้ของแต่ละผล — ผู้พิพาทเลือกจำนวนจริงได้ตั้งแต่ 0 ถึงเพดานนี้
    function cutCap(uint256 disputeId, Outcome outcome) public view returns (uint256) {
        Rental storage r = rentals[disputes[disputeId].rentalId];
        if (outcome == Outcome.Renter) return uint256(r.bond) + r.rent; // หักจากฝั่งผู้ปล่อยเช่า
        if (outcome == Outcome.Lender) return r.deposit;                // หักจากมัดจำผู้เช่า
        return 0;
    }

    /**
     * @notice ตัดสินข้อพิพาทและปล่อยเงินจาก escrow
     * @param outcome  Renter = ผู้ปล่อยเช่าผิด / Lender = ผู้เช่าผิด
     * @param cut      จำนวนเงินที่หัก ปรับได้ตามความเหมาะสม ไม่ต้องเต็มจำนวน
     */
    function judge(uint256 disputeId, Outcome outcome, uint128 cut) external notPaused {
        _requireCanJudge(disputeId, outcome, cut);
        Payout memory p = _settleDispute(disputeId, outcome, cut);
        _closeDispute(disputeId, outcome, cut);
        _payArbitrator(disputeId);
        emit Judged(disputeId, msg.sender, outcome, cut, p.toRenter, p.toLender, p.fee);
    }

    /// ตรวจสิทธิ์และความถูกต้องก่อนตัดสิน
    function _requireCanJudge(uint256 disputeId, Outcome outcome, uint128 cut) internal view {
        Dispute storage d = disputes[disputeId];
        require(d.arbitrator == msg.sender, "NOT_YOUR_CASE");
        require(!d.resolved, "ALREADY_RESOLVED");
        require(stakeOf[msg.sender] >= minStake, "STAKE_TOO_LOW");
        require(outcome != Outcome.None, "BAD_OUTCOME");
        require(msg.sender != d.renter && msg.sender != d.lender, "CONFLICT_OF_INTEREST");
        require(cut <= cutCap(disputeId, outcome), "CUT_TOO_HIGH");
    }

    /**
     * แบ่งเงินใน escrow ตามผลตัดสินแล้วตั้งยอดให้แต่ละฝั่งมาถอน
     * เงินออกครบพอดีเสมอ: toRenter + toLender + fee == rent + deposit + bond
     */
    function _settleDispute(uint256 disputeId, Outcome outcome, uint128 cut)
        internal returns (Payout memory p)
    {
        Dispute storage d = disputes[disputeId];
        Rental  storage r = rentals[d.rentalId];

        if (outcome == Outcome.Renter) {
            p.toRenter = uint256(r.deposit) + cut;
            p.toLender = uint256(r.rent) + r.bond - cut;
        } else {
            p.toRenter = uint256(r.deposit) - cut;
            p.toLender = uint256(r.rent) + r.bond + cut;
        }
        // ค่าธรรมเนียมหักจากฝั่งผู้ปล่อยเช่า และหักได้ไม่เกินที่ฝั่งนั้นได้รับจริง
        p.fee = r.fee > p.toLender ? p.toLender : r.fee;
        p.toLender -= p.fee;

        treasury += p.fee;
        _credit(d.renter, p.toRenter);
        _credit(d.lender, p.toLender);
    }

    /// ปิดเคสและปลดสิ่งของกลับสู่สถานะพร้อมให้ยืม
    function _closeDispute(uint256 disputeId, Outcome outcome, uint128 cut) internal {
        Dispute storage d = disputes[disputeId];
        d.outcome  = outcome;
        d.cut      = cut;
        d.closedAt = uint64(block.timestamp);
        d.resolved = true;

        Rental storage r = rentals[d.rentalId];
        r.status = RentalStatus.Resolved;
        items[r.itemId].status = ItemStatus.Available;
        activeRentalOf[r.itemId] = 0;
    }

    /// ค่าตอบแทนผู้พิพาทจ่ายจากคลังค่าธรรมเนียม จ่ายเมื่อคลังมีพอเท่านั้น
    function _payArbitrator(uint256 disputeId) internal {
        address a = msg.sender;
        casesClosed[a]++;
        if (repOf[a] < 100) repOf[a]++;
        if (treasury >= arbReward) {
            treasury   -= arbReward;
            earnedOf[a] += arbReward;
            rewardPaid += arbReward;
            _credit(a, arbReward);
            emit RewardPaid(a, disputeId, arbReward);
        }
    }

    function disputeCount() external view returns (uint256) { return disputes.length; }

    /// เลยกรอบเวลาพิจารณา 48 ชม. หรือยัง (หน้าเว็บใช้แสดงเวลาที่เหลือ)
    function isOverdue(uint256 disputeId) external view returns (bool) {
        Dispute storage d = disputes[disputeId];
        if (d.resolved || d.claimedAt == 0) return false;
        return block.timestamp > d.claimedAt + JUDGE_SLA;
    }

    /* ═══════════════════════ 5. ผู้พิพาท ═══════════════════════ */

    /// @notice สมัครเป็นผู้พิพาทพร้อมวางเงินประกัน — Admin สมัครเองไม่ได้ (แยกอำนาจ)
    function applyArbitrator(string calldata profileURI) external payable notPaused {
        require(applicationsOpen, "APPLICATIONS_CLOSED");
        require(msg.sender != owner, "ADMIN_CANNOT_APPLY");
        require(!isArbitrator[msg.sender], "ALREADY_ARBITRATOR");
        require(applicationOf[msg.sender] == 0, "ALREADY_APPLIED");
        require(msg.value >= minStake, "STAKE_TOO_LOW");

        applications.push(Application(msg.sender, uint128(msg.value), uint64(block.timestamp), profileURI, true));
        applicationOf[msg.sender] = applications.length;
        emit ApplicationSubmitted(applications.length - 1, msg.sender, msg.value);
    }

    function approveApplication(uint256 appId) external onlyOwner {
        Application storage a = applications[appId];
        require(a.open, "CLOSED");
        a.open = false;
        applicationOf[a.applicant] = 0;

        isArbitrator[a.applicant] = true;
        stakeOf[a.applicant] = a.stake;
        repOf[a.applicant] = 100;
        arbitrators.push(a.applicant);
        arbIndex[a.applicant] = arbitrators.length;
        emit ApplicationApproved(appId, a.applicant);
    }

    function rejectApplication(uint256 appId) external onlyOwner {
        Application storage a = applications[appId];
        require(a.open, "CLOSED");
        a.open = false;
        applicationOf[a.applicant] = 0;
        uint256 back = a.stake;
        a.stake = 0;
        _credit(a.applicant, back);   // คืนเงินประกันเต็มจำนวน
        emit ApplicationRejected(appId, a.applicant, back);
    }

    function topUpStake() external payable {
        require(isArbitrator[msg.sender], "NOT_ARBITRATOR");
        require(msg.value > 0, "ZERO");
        stakeOf[msg.sender] += msg.value;
        emit StakeAdded(msg.sender, msg.value, stakeOf[msg.sender]);
    }

    /* ---- ถอนตัว: ต้องยืนยันแล้วรอ Admin อนุมัติ ไม่ใช่ถอนได้ทันที ---- */

    function requestExit(uint8 reason) external {
        require(isArbitrator[msg.sender], "NOT_ARBITRATOR");
        require(exitRequestOf[msg.sender] == 0, "ALREADY_REQUESTED");
        require(_openCasesOf(msg.sender) == 0, "HAS_OPEN_CASES");

        exitRequests.push(ExitRequest(msg.sender, uint64(block.timestamp), reason, true));
        exitRequestOf[msg.sender] = exitRequests.length;
        emit ExitRequested(exitRequests.length - 1, msg.sender, reason);
    }

    function cancelExit() external {
        uint256 idx = exitRequestOf[msg.sender];
        require(idx != 0, "NO_REQUEST");
        exitRequests[idx - 1].open = false;
        exitRequestOf[msg.sender] = 0;
        emit ExitCancelled(idx - 1, msg.sender);
    }

    function approveExit(uint256 exitId) external onlyOwner {
        ExitRequest storage x = exitRequests[exitId];
        require(x.open, "CLOSED");
        require(_openCasesOf(x.arbitrator) == 0, "HAS_OPEN_CASES");
        x.open = false;
        exitRequestOf[x.arbitrator] = 0;
        uint256 back = _removeArbitrator(x.arbitrator);
        emit ExitApproved(exitId, x.arbitrator, back);
    }

    function rejectExit(uint256 exitId) external onlyOwner {
        ExitRequest storage x = exitRequests[exitId];
        require(x.open, "CLOSED");
        x.open = false;
        exitRequestOf[x.arbitrator] = 0;
        emit ExitRejected(exitId, x.arbitrator);
    }

    /// @notice Admin ริบเงินประกัน — ต่ำกว่าเกณฑ์เมื่อไหร่ถูกพักสิทธิ์อัตโนมัติ
    function slashStake(address arb, uint256 amount, uint8 reason) external onlyOwner {
        require(isArbitrator[arb], "NOT_ARBITRATOR");
        require(amount > 0 && amount <= stakeOf[arb], "BAD_AMOUNT");
        stakeOf[arb] -= amount;
        treasury += amount;
        repOf[arb] = repOf[arb] > 15 ? repOf[arb] - 15 : 0;
        emit StakeSlashed(arb, amount, stakeOf[arb], reason);
    }

    /**
     * @notice ถอดสิทธิ์ผู้พิพาท (มาตรการลงโทษ มีผลทันที)
     * @dev    เคสที่ถืออยู่ถูกปล่อยกลับเข้าคิว ไม่ปล่อยให้เคสค้างโดยไม่มีผู้รับผิดชอบ
     */
    function revokeArbitrator(address arb) external onlyOwner {
        require(isArbitrator[arb], "NOT_ARBITRATOR");
        uint256 released = 0;
        for (uint256 i = 0; i < disputes.length; i++) {
            if (!disputes[i].resolved && disputes[i].arbitrator == arb) {
                disputes[i].arbitrator = address(0);
                disputes[i].claimedAt = 0;
                released++;
                emit CaseReleased(i, arb, "arbitrator revoked");
            }
        }
        if (exitRequestOf[arb] != 0) {
            exitRequests[exitRequestOf[arb] - 1].open = false;
            exitRequestOf[arb] = 0;
        }
        uint256 back = _removeArbitrator(arb);
        emit ArbitratorRevoked(arb, back, released);
    }

    function _removeArbitrator(address arb) internal returns (uint256 back) {
        back = stakeOf[arb];
        stakeOf[arb] = 0;
        isArbitrator[arb] = false;

        uint256 idx = arbIndex[arb];
        if (idx != 0) {
            uint256 i = idx - 1;
            address last = arbitrators[arbitrators.length - 1];
            arbitrators[i] = last;
            arbIndex[last] = i + 1;
            arbitrators.pop();
            arbIndex[arb] = 0;
        }
        if (back > 0) _credit(arb, back);
    }

    function _openCasesOf(address arb) internal view returns (uint256 n) {
        for (uint256 i = 0; i < disputes.length; i++) {
            if (!disputes[i].resolved && disputes[i].arbitrator == arb) n++;
        }
    }

    function arbitratorCount() external view returns (uint256) { return arbitrators.length; }
    function applicationCount() external view returns (uint256) { return applications.length; }
    function exitRequestCount() external view returns (uint256) { return exitRequests.length; }

    /// ผู้พิพาทคนนี้ใช้งานได้จริงไหม (หน้าเว็บใช้แสดงป้าย ACTIVE / SUSPENDED)
    function isActiveArbitrator(address a) external view returns (bool) {
        return isArbitrator[a] && stakeOf[a] >= minStake;
    }

    /* ═══════════════════════ 6. ตั้งค่าระบบ (Admin) ═══════════════════════ */

    function setFeeBps(uint16 bps) external onlyOwner {
        require(bps <= MAX_FEE_BPS, "FEE_TOO_HIGH");
        emit FeeChanged(feeBps, bps);
        feeBps = bps;
    }

    function setMinStake(uint256 v) external onlyOwner {
        emit MinStakeChanged(minStake, v);
        minStake = v;   // ผู้พิพาทที่ประกันต่ำกว่าเกณฑ์ใหม่ถูกพักสิทธิ์ทันทีโดยอัตโนมัติ
    }

    function setArbReward(uint256 v) external onlyOwner {
        emit RewardChanged(arbReward, v);
        arbReward = v;
    }

    function setApplicationsOpen(bool v) external onlyOwner {
        applicationsOpen = v;
        emit ApplicationsOpenChanged(v);
    }

    function setPaused(bool v) external onlyOwner {
        paused = v;
        emit PausedChanged(v);
    }

    function withdrawTreasury(address to, uint256 amount) external onlyOwner {
        require(amount <= treasury, "INSUFFICIENT");
        treasury -= amount;
        _credit(to, amount);
        emit TreasuryWithdrawn(to, amount);
    }

    /* ═══════════════════════ 7. ถอนเงิน (pull payment) ═══════════════════════ */

    function _credit(address to, uint256 amount) internal {
        if (amount > 0) pendingWithdrawal[to] += amount;
    }

    /// @notice ถอนเงินที่สัญญาค้างจ่ายให้เรา — มัดจำคืน ค่าเช่า ค่าตอบแทน เงินประกัน
    function withdraw() external {
        uint256 amount = pendingWithdrawal[msg.sender];
        require(amount > 0, "NOTHING_TO_WITHDRAW");
        pendingWithdrawal[msg.sender] = 0;          // ตัดยอดก่อนโอน กัน reentrancy
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "TRANSFER_FAILED");
        emit Withdrawn(msg.sender, amount);
    }

    receive() external payable { treasury += msg.value; }
}
