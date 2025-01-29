import React from 'react';
import {Text, SafeAreaView, ScrollView, View, StyleSheet} from 'react-native';
const Privacy_v20250128 = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginTop: 20}}>
          <Text style={styles.text}>
            개발팀 SPIRIT(이하 ‘운영자”라 한다)은 정보통신망 이용촉진 및
            정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령에 따라 이용자의
            개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수
            있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립합니다.
          </Text>
          <View style={{marginTop: 10}} />
          <Text style={styles.text}>
            개인정보처리방침은 이용자가 언제나 쉽게 열람할 수 있도록 서비스
            초기화면을 통해 공개하고 있으며, 개인정보 관련법령, 지침, 고시 또는
            서비스 정책의 따라 변경될 수 있습니다.
          </Text>
        </View>
        <View>
          <Text style={styles.title}>1. 개인정보 수집・이용</Text>
          <Text style={styles.text}>
            운영자는 다음과 같이 이용자의 개인정보를 수집합니다. 운영자가
            처리하고 있는 개인정보는 다음의 수집・이용 목적 이외의 용도로는
            활용되지 않으며, 수집・이용 목적이 변경되는 경우에는
            개인정보보호법에 따라 별도의 동의를 받는 등 필요한 조치를
            이행합니다.
          </Text>
          <Text style={styles.numbertext}>
            1) 회원의 정보 수집・이용 목적, 수집 항목, 보유・이용기간은 다음과
            같습니다.
          </Text>
          <View>
            <View style={[styles.row, styles.header]}>
              <Text style={[styles.col_1_1_1, styles.headerText]}>구분</Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_1_2, styles.headerText]}>
                수집・이용 목적
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_1_3, styles.headerText]}>
                수집 항목
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_1_4, styles.headerText]}>
                보유 및 이용 기간
              </Text>
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_1_1_1, styles.colText]}>회원 관리</Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_1_2, styles.colText]}>
                SNS 간편가입, 한잔할까 서비스 제공, 휴대전화번호 인증, 불법 및
                부정 이용 방지
              </Text>
              <View style={styles.colDivider} />
              <View style={[styles.col_1_1_3, styles.colText]}>
                <Text style={styles.colText}>서비스 이용 닉네임</Text>
                <Text style={styles.colText}>
                  - 닉네임, 이름, 휴대전화 번호, 생년월일
                </Text>
                <Text style={styles.colText}>SNS 간편가입</Text>
                <Text style={styles.colText}>
                  - 운영자가 제3자로부터 제공받은 개인정보
                </Text>
                <Text style={styles.colText}>- 카카오: 카카오 ID 코드</Text>
                <Text style={styles.colText}>- APPLE ID: APPLE ID 코드</Text>
                <Text style={styles.colText}>- GOOGLE ID: GOOGLE ID 코드</Text>
              </View>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_1_4, styles.colText]}>
                회원탈퇴 시 지체없이 파기 (단, 관련법령 및 서비스 이용 정책 및
                운영 정책에 따라 별도 보관되는 정보는 예외)
              </Text>
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_1_1_1, styles.colText]}>
                서비스 {'\n'}이용
              </Text>
              <View style={styles.colDivider} />
              <View style={[styles.col_1_1_2]}>
                <View style={[styles.rowView, {height: 70}]}>
                  <Text style={styles.colText}>
                    서비스 진행사항 안내, 계약 이행 및 약관변경 등의 고지
                  </Text>
                </View>
                <View style={styles.rowDivider} />
                <View style={[styles.rowView, {height: 110}]}>
                  <Text style={styles.colText}>
                    (휴대전화 본인인증, 성인인증) 서비스 이용을 위해 이용자 식별
                  </Text>
                </View>
                <View style={styles.rowDivider} />
                <View style={[styles.rowView, {height: 60}]}>
                  <Text style={styles.colText}>위치정보 기반 서비스 제공</Text>
                </View>
              </View>
              <View style={styles.colDivider} />
              <View style={[styles.col_1_1_2]}>
                <View style={[styles.rowView, {height: 70}]}>
                  <Text style={styles.colText}>휴대전화 번호</Text>
                </View>
                <View style={styles.rowDivider} />
                <View style={[styles.rowView, {height: 110}]}>
                  <Text style={styles.colText}>
                    운영자가 제3자로부터 제공받은 개인정보: 이름, 휴대전화 번호,
                    생년월일, 성별, CI(연계정보)
                  </Text>
                </View>
                <View style={styles.rowDivider} />
                <View style={[styles.rowView, {height: 60}]}>
                  <Text style={styles.colText}>위치 정보</Text>
                </View>
              </View>
              <View style={styles.colDivider} />
              <View style={[styles.col_1_1_2]}>
                <View style={[styles.rowView, {height: 181}]}>
                  <Text style={styles.colText}>
                    회원탈퇴 시 지체없이 파기 (단, 관련법령 및 서비스 이용 정책
                    및 운영 정책에 따라 별도 보관되는 정보는 예외)
                  </Text>
                </View>
                <View style={styles.rowDivider} />
                <View style={[styles.rowView, {height: 60}]}>
                  <Text style={styles.colText}>
                    동의 철회, 회원 탈퇴, 서비스 종료일 도래 시 까지
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{marginTop: 10}} />
          <Text style={styles.numbertext}>
            2) 서비스 및 운영자 정책에 의하여 수집・이용되는 이용자의 정보는
            다음과 같습니다.
          </Text>
          <View>
            <View style={[styles.row, styles.header]}>
              <Text style={[styles.col_1_2_1, styles.headerText]}>구분</Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_2_2, styles.headerText]}>
                수집・이용 목적
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_2_3, styles.headerText]}>
                수집 항목
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_2_4, styles.headerText]}>
                보유 및 이용 기간
              </Text>
              <View style={styles.colDivider} />
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_1_2_1, styles.colText]}>
                서비스 및 운영자 내부 정책
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_2_2, styles.colText]}>
                회원가입 남용(부정거래), 서비스 부정 사용(허위 사실 기재,
                이용약관 위반 행위) 확인 및 방지, 수사 기관 협조
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_2_3, styles.colText]}>
                이름, 휴대전화 번호, CI(연계정보), 회원이 작성한 게시물
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_1_2_4, styles.colText]}>
                회원탈퇴 후 3년간 보관
              </Text>
            </View>
          </View>
          <View style={{marginTop: 10}} />
          <Text style={styles.numbertext}>
            3) 서비스의 안정성 확보, 법률 및 서비스 이용약관 위반 행위 제한 등의
            목적으로 서비스를 이용하는 과정에서 자동으로 수집 정보가 생성되어
            수집, 저장, 조합, 분석될 수 있습니다.
          </Text>
          <Text style={styles.subtext}>
            - IP 주소, 쿠키, 서비스 이용 기록, 기기 정보(기기고유번호, OS버전,
            모델명, 제조사 정보 등), 광고ID, 통신기록 등
          </Text>
          <Text style={styles.numbertext}>
            4) 동의를 거부할 권리가 있으나, 수집하는 정보는 서비스 제공을 위해
            필요한 최소한의 개인정보이므로 동의 거부 시 한잔할까 서비스 이용이
            제한됩니다.
          </Text>
        </View>
        <View>
          <Text style={styles.title}>
            2. 개인정보의 보유기간 및 파기 절차・방법
          </Text>
          <Text style={styles.text}>
            1) 운영자는 이용자가 개인정보 동의를 철회하거나 보유・이용기간의
            경과, 회원탈퇴, 서비스 이용약관에 따른 계약해지 등 개인정보가
            불필요하게 되었을 때 지체없이 해당 개인정보를 파기합니다. 같습니다.
          </Text>
          <Text style={styles.numbertext}>
            2) 이용자로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이
            달성되었음에도 불구하고 법령에 따라 개인정보를 일정기간 보관하여야
            하는 경우에는 개인정보를 별도 분리 보관합니다.
          </Text>
          <View>
            <View style={[styles.row, styles.header]}>
              <Text style={[styles.col_2_1_1, styles.headerText]}>법령</Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_2_1_2, styles.headerText]}>
                보유 항목
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_2_1_3, styles.headerText]}>
                보유 기간
              </Text>
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_2_1_1, styles.colText]}>
                전자상거래법 등에서의 소비자보호에 관한 법률 제6조
              </Text>
              <View style={styles.colDivider} />
              <View style={[styles.col_2_1_2]}>
                <View style={[styles.rowView, {height: 40}]}>
                  <Text style={styles.colText}>
                    계약 또는 청약철회 등에 관한 기록
                  </Text>
                </View>
                <View style={styles.rowDivider} />
                <View style={[styles.rowView, {height: 50}]}>
                  <Text style={styles.colText}>
                    대금결제 및 재화 등의 공급에 관한 기록
                  </Text>
                </View>
                <View style={styles.rowDivider} />
                <View style={[styles.rowView, {height: 40}]}>
                  <Text style={styles.colText}>
                    소비자의 불만 또는 분쟁 처리에 관한 기록
                  </Text>
                </View>
              </View>

              <View style={styles.colDivider} />
              <View style={[styles.col_2_1_3]}>
                <View style={[styles.rowView, {height: 40}]}>
                  <Text style={styles.colText}>5년</Text>
                </View>
                <View style={styles.rowDivider} />
                <View style={[styles.rowView, {height: 50}]}>
                  <Text style={styles.colText}>5년</Text>
                </View>
                <View style={styles.rowDivider} />
                <View style={[styles.rowView, {height: 40}]}>
                  <Text style={styles.colText}>3년</Text>
                </View>
              </View>
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_2_1_1, styles.colText]}>
                위치정보의 보호 및 이용 등에 관한 법률
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_2_1_2, styles.colText]}>
                개인위치정보에 관한 기록
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_2_1_3, styles.colText]}>6개월</Text>
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_2_1_1, styles.colText]}>
                통신비밀보호법
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_2_1_2, styles.colText]}>
                서비스 이용 관련 개인정보(로그 기록)
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_2_1_3, styles.colText]}>3개월</Text>
            </View>
          </View>
          <Text style={styles.numbertext}>
            3) 운영자는 3년 동안 서비스를 이용하지 않은 장기미이용 회원의
            개인정보를 파기하거나 별도로 분리하여 저장할 수 있습니다.
          </Text>
          <Text style={styles.subtext}>
            - 이 회원의 개인정보는 즉시 탈퇴 처리되며, 대상자에게 안내는 탈퇴
            처리일 기준으로 최소 30일 이전에 이용자에게 알릴 수 있습니다. 이를
            위해 이용자는 운영자에게 정확한 연락처 정보를 알리거나 수정하여야
            합니다.
          </Text>
          <Text style={styles.numbertext}>4) 개인정보 파기 절차와 방법</Text>
          <Text style={styles.subtext}>
            - 파기절차: 개인정보 목적 달성 후 내부 지침 및 관련 법령에 의한
            의무에 따라 일정기간 동안 별도로 분리하여 저장한 후 파기합니다
          </Text>
          <Text style={styles.subtext}>
            - 파기방법: 운영자는 전자적 파일 형태로 저장된 개인정보는 기록을
            재사용할 수 없도록 영구 파기하며, 종이문서에 출력된 개인정보는
            분쇄기로 분쇄하거나 소각하여 파기합니다.
          </Text>
        </View>
        <View>
          <Text style={styles.title}>3. 개이용자의 권리・의무 및 행사방법</Text>
          <Text style={styles.text}>
            1) 이용자는 언제든지 운영자에게 자신의 개인정보를 열람, 정정 및
            삭제, 처리정지 요청, 동의 철회를 요구할 수 있으며, 운영자는 이를
            위한 기능을 제공합니다.
          </Text>
          <Text style={styles.numbertext}>
            2) 이용자는 개인정보 보호와 관련하여 다음과 같은 의무를 가집니다.
          </Text>
          <Text style={styles.subtext}>
            - 개인정보를 최신 상태로 유지하며, 부정확한 정보 입력으로 발생하는
            문제에 대한 책임은 이용자에게 있습니다.
          </Text>
          <Text style={styles.subtext}>
            - ID, 비밀번호 등 접근 매체에 대한 보안을 유지해야 하며, 이를
            타인에게 양도하거나 대여할 수 없습니다.
          </Text>
          <Text style={styles.subtext}>
            - 타인의 개인정보를 침해하거나 도용하지 않아야 하며, 이를 위반할
            경우 회원 자격 상실 또는 법적 처벌을 받을 수 있습니다.
          </Text>
          <Text style={styles.subtext}>
            - 게시물 작성 시 타인의 개인정보를 훼손하지 않도록 유의해야 합니다.
          </Text>
          <Text style={styles.numbertext}>
            3) 이용자가 개인정보의 정정을 요청한 경우, 정정이 완료되기 전까지
            해당 개인정보는 이용되거나 제공되지 않습니다.
          </Text>
          <Text style={styles.numbertext}>
            4) 잘못된 개인정보를 이미 제3자에게 제공한 경우, 운영자는 정정 처리
            결과를 제3자에게 통지하여 정정이 이루어지도록 합니다.
          </Text>
        </View>

        <View>
          <Text style={styles.title}>4. 개인정보의 안전성 확보조치</Text>
          <Text style={styles.text}>
            운영자는 이용자의 개인정보를 처리함에 있어 개인정보가 분실, 도난,
            유출, 변조 또는 훼손되지 않도록 다음과 같은 기술적, 관리적 보호
            조치를 통해 개인정보의 안전성을 확보하고 있습니다.
          </Text>

          <Text style={styles.numbertext}>1) 해킹 등에 대비한 기술적 조치</Text>
          <Text style={styles.subtext}>
            - AWS의 보안 정책을 준수하여 서버와 데이터의 안전을 보장합니다.
          </Text>
          <Text style={styles.subtext}>
            - AWS의 가상 사설 클라우드(VPC), 네트워크 ACL 등을 이용해 외부
            침입을 차단합니다.
          </Text>
          <Text style={styles.subtext}>
            - 최신 백신 및 보안 소프트웨어를 사용하여 악성코드나 바이러스를
            방지하며, AWS GuardDuty를 통해 실시간 위협을 모니터링합니다.
          </Text>
          <Text style={styles.subtext}>
            - 데이터는 전송 중에는 SSL/TLS를 사용해 암호화하고, 저장 시에는
            AWS의 **KMS(Key Management Service)**를 통해 암호화합니다.
          </Text>

          <Text style={styles.numbertext}>
            2) 개인정보 처리 최소화 및 관리적 조치
          </Text>
          <Text style={styles.subtext}>
            - 개인정보 처리 담당자를 최소화하고, 개인정보 보호와 관련한 내부
            교육을 정기적으로 시행하여 법령 및 내부 방침을 준수하도록 하고
            있습니다.
          </Text>
          <Text style={styles.subtext}>
            - 내부관리계획을 수립 및 시행하며, 정기적인 자체 감사 및 보안 점검을
            통해 관리적 보안을 강화하고 있습니다.
          </Text>

          <Text style={styles.numbertext}>3) AWS 인프라 보안 활용</Text>
          <Text style={styles.subtext}>
            - AWS가 제공하는 데이터센터 물리적 보안 및 환경 관리를 통해 물리적
            서버에 대한 보안을 강화하고 있습니다.
          </Text>
          <Text style={styles.subtext}>
            - 데이터베이스 관리에는 Amazon RDS를 사용하며, RDS의 자동화된 백업,
            암호화 및 복구 기능을 활용하여 데이터의 무결성과 가용성을
            유지합니다.
          </Text>
          <Text style={styles.subtext}>
            - AWS IAM(Identity and Access Management)을 통해 사용자와 권한을
            세분화하여 불필요한 접근을 차단합니다.
          </Text>
          <Text style={styles.numbertext}>4) 인증 및 점검 활동</Text>
          <Text style={styles.subtext}>
            - AWS의 보안 인증(ISO 27001, SOC 2 등)을 기반으로 안전한 데이터
            환경을 유지하고 있습니다.
          </Text>
          <Text style={styles.subtext}>
            - 정보보호 및 개인정보보호 관리체계(ISMS-P) 인증을 획득하고, 이를
            유지하기 위해 정기적인 검증 및 점검을 실시합니다.
          </Text>
          <Text style={styles.subtext}>
            - 개인정보 보호법 등 관계 법령에서 요구하는 법적 사항을 준수하며,
            주기적인 내부 및 외부 보안 점검을 통해 개인정보를 안전하게
            관리합니다.
          </Text>

          <Text style={styles.numbertext}>
            운영자는 위와 같은 조치를 통해 이용자의 개인정보를 안전하게 보호하기
            위해 최선을 다하며, AWS가 제공하는 고급 보안 기능을 적극 활용하여
            데이터 유출 및 손상 방지를 위해 지속적으로 보안을 강화하고 있습니다.
          </Text>
        </View>
        <View>
          <Text style={styles.title}>5. 개인정보 보호책임자</Text>
          <View>
            <View style={[styles.row, styles.header]}>
              <Text style={[styles.col_3_1_1, styles.headerText]}>성명</Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_3_1_2, styles.headerText]}>직책</Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_3_1_3, styles.headerText]}>이메일</Text>
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_3_1_1, styles.colText]}>윤준서</Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_3_1_2, styles.colText]}>
                개인정보 보호책임자
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_3_1_3, styles.colText]}>
                team19spirit@gmail.com
              </Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.title}>6. 권익침해 구제 방법</Text>
          <View>
            <View style={[styles.row]}>
              <Text style={[styles.col_4_1_1, styles.colText]}>
                개인정보 침해신고센터
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_4_1_2, styles.colText]}>
                (국번없이) 118{'\n'}privacy.kisa.or.kr
              </Text>
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_4_1_1, styles.colText]}>대검찰청</Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_4_1_2, styles.colText]}>
                (국번없이) 1301{'\n'}www.spo.go.kr
              </Text>
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_4_1_1, styles.colText]}>경찰청</Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_4_1_2, styles.colText]}>
                (국번없이) 182{'\n'}www.cyber.go.kr
              </Text>
            </View>
            <View style={[styles.row2]}>
              <Text style={[styles.col_4_1_1, styles.colText]}>
                개인정보분쟁조정위원회
              </Text>
              <View style={styles.colDivider} />
              <Text style={[styles.col_4_1_2, styles.colText]}>
                1833-6972{'\n'}www.kopico.go.kr
              </Text>
            </View>
          </View>
        </View>
        <View>
          <Text style={styles.title}>7. 고지의 의무</Text>
          <Text style={styles.text}>
            1) 현 개인정보처리방침은 법령, 정부의 정책 또는 서비스 운영 정책 등
            필요에 의하여 변경될 수 있으며, 변경하는 경우 운영자는 사전에
            공지하고 서비스 초기 화면 팝업 등을 통해 고지할 것입니다.
          </Text>
          <Text style={styles.text}>
            2) 현 개인정보처리방침은 2025년 2월 1일부터 적용되며, 변경 전의
            개인정보처리방침은 공지사항을 통해서 확인하실 수 있습니다.
          </Text>
          <Text style={styles.numbertext}>- 공고일자: 2025년 1월 25일</Text>
          <Text style={styles.text}>- 시행일자: 2025년 2월 1일</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginBottom: 70,
    marginTop: -20,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
    marginTop: 20,
    marginBottom: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
    color: '#999',
  },
  numbertext: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 3,
    color: '#999',
  },

  subtext: {
    width: '95%',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
    color: '#999',
    alignSelf: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#999',
  },
  row2: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#999',
  },
  col_1_1_1: {
    width: '10%',
    textAlign: 'center',
  },
  col_1_1_2: {
    width: '30%',
    textAlign: 'center',
  },
  col_1_1_3: {
    width: '30%',
    textAlign: 'center',
  },
  col_1_1_4: {
    width: '30%',
    textAlign: 'center',
  },

  col_1_2_1: {
    width: '20%',
    textAlign: 'center',
  },
  col_1_2_2: {
    width: '35%',
    textAlign: 'center',
  },
  col_1_2_3: {
    width: '25%',
    textAlign: 'center',
  },
  col_1_2_4: {
    width: '20%',
    textAlign: 'center',
  },

  col_2_1_1: {
    width: '45%',
    textAlign: 'center',
  },
  col_2_1_2: {
    width: '40%',
    textAlign: 'center',
  },
  col_2_1_3: {
    width: '15%',
    textAlign: 'center',
  },

  col_3_1_1: {
    width: '15%',
    textAlign: 'center',
  },
  col_3_1_2: {
    width: '35%',
    textAlign: 'center',
  },
  col_3_1_3: {
    width: '50%',
    textAlign: 'center',
  },

  col_4_1_1: {
    width: '50%',
    textAlign: 'center',
  },
  col_4_1_2: {
    width: '50%',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#f1f1f1',
    marginTop: 10,
  },
  headerText: {
    fontWeight: '600',
    alignSelf: 'center',
    paddingVertical: 3,
    fontSize: 14,
  },

  colDivider: {
    width: 1,
    backgroundColor: '#999',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#999',
  },
  rowView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  colText: {
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
    color: '#777',
    paddingHorizontal: 2,
  },
});

export default Privacy_v20250128;
