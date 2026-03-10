<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabase.js'

const activeTab = ref('naver')
const email = ref('')
const applicantCount = ref(0)

const previewTabs = [
  { id: 'naver', label: '네이버부동산' },
  { id: 'zigbang', label: '직방' },
  { id: 'instagram', label: '인스타그램' },
  { id: 'sms', label: '문자' },
]

const initialPreviewContent = {
  naver: `✅ 신답역(5호선)·신답역(2호선) 도보 3~5분 더블역세권
✅ 올수리 완료, 내부 깔끔한 상태 유지
✅ 재건축 추진 단지 — 미래가치 상승 기대
✅ 전세보다 저렴한 매매가, 사는 게 이득!
✅ 여의도·강남 30분 출퇴근 가능 입지
✅ 평지, 생활인프라 풍부

직장인·실거주자 모두에게 강력 추천하는 매물입니다.
지금 전세 사느니 이 가격에 매입해서
살다 보면 웃을 날이 옵니다 😊

궁금하신 점은 편하게 연락 주세요.
📞 02-2247-0000`,
  zigbang: `[더블역세권 올수리] 신답역 도보 3분, 재건축 추진
전세보다 싼 매매가·여의도/강남 30분
직장인·실거주 강력추천 📞02-2247-0000`,
  instagram: `🏠 오늘의 매물 소개합니다 🏠

📍 신답역 도보 3~5분 더블역세권
🔨 올수리 완료 깔끔한 상태
🏗️ 재건축 추진 중 — 미래가치 UP
💰 전세보다 싼 매입가
🚇 여의도·강남 30분 출퇴근

전세 사느니 이 가격에 내 집 마련하세요 💫
문의는 DM 또는 📞02-2247-0000

#더블역세권 #올수리빌라 #재건축 #직장인추천
#내집마련 #부동산 #답십리부동산`,
  sms: `[매물] 신답역도보3분 더블역세권 올수리
재건축추진·전세보다싼매입가
문의 02-2247-0000`,
}

const generatedPreviewContent = {
  naver: `✅ 지하철 2호선·5호선 신답역 도보 3~5분 더블역세권
✅ 올수리 완료, 새집 같은 내부 컨디션
✅ 재건축 추진 단지, 장기 미래가치 기대
✅ 매매가가 전세보다 저렴 — 지금이 매입 타이밍!
✅ 여의도·강남 모두 30분대 출퇴근 가능
✅ 평지 위치, 마트·병원·학교 생활인프라 완비

실거주하면서 재건축 수익까지 노릴 수 있는
희귀 매물입니다. 직장인·신혼부부 강력 추천!

관리비는 실비 기준이며 자세한 내용은
전화 문의 주시면 상세히 안내드리겠습니다.
📞 02-2247-0000 (공인중개사 등록 사무소)`,
  zigbang: `[더블역세권+재건축] 신답역 도보3분 올수리 완료
전세<매매가 · 여의도/강남 30분 출퇴근
직장인·실거주 강추 즉시상담 📞02-2247-0000`,
  instagram: `🏠 놓치면 후회할 매물 소개합니다 🏠

📍 2호선·5호선 신답역 도보 3~5분
🔨 올수리 완료 — 입주 즉시 가능
🏗️ 재건축 추진 중 미래가치 상승 예정
💡 전세보다 싼 매매가, 지금이 기회!
🚇 여의도·강남 30분대 출퇴근

전세 만기 앞두셨나요?
이 가격에 내 집 마련하고
재건축 수익까지 노려보세요 💫

📞 02-2247-0000
#더블역세권 #재건축추진 #올수리 #전세보다싼매매
#직장인추천 #답십리부동산 #내집마련`,
  sms: `[매물안내] 2·5호선신답역도보3분
올수리·재건축추진·전세보다싼매매가
여의도/강남30분 📞02-2247-0000`,
}

const highlightsPlaceholder = `생각나는 대로 자유롭게 적어주세요.

예시:
- 신답역 도보 3분, 2호선·5호선 더블역세권
- 올수리 완료, 깔끔한 상태
- 재건축 추진 중, 미래가치 기대
- 전세보다 싼 매입가, 직장인·실거주 강추
- 여의도·강남 30분 출퇴근 가능`

const propertyTypes = ['아파트', '빌라·연립', '오피스텔', '상가', '토지']
const dealTypes = ['매매', '전세', '월세']
const directions = ['남향', '남동향', '남서향', '동향', '서향', '북향', '해당없음']

const formData = ref({
  propertyType: '아파트',
  dealType: '매매',
  area: '',
  floor: '',
  price: '',
  direction: '남향',
  highlights: '',
  phone: '',
  licenseNumber: '',
})

const isGenerating = ref(false)
const hasGenerated = ref(false)
const copySuccessTab = ref(null)

const currentPreviewContent = () => hasGenerated.value ? generatedPreviewContent : initialPreviewContent

function handleGenerate() {
  isGenerating.value = true
  setTimeout(() => {
    hasGenerated.value = true
    isGenerating.value = false
  }, 1500)
}

async function copyToClipboard(tabId) {
  const text = currentPreviewContent()[tabId]
  await navigator.clipboard.writeText(text)
  copySuccessTab.value = tabId
  setTimeout(() => { copySuccessTab.value = null }, 1500)
}

function getCharCount(tabId) {
  return currentPreviewContent()[tabId].length
}

const signupStatus = ref('idle') // idle | submitting | success
const signupError = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handleSignup() {
  const emailValue = email.value.trim().toLowerCase()
  signupError.value = ''

  if (!emailValue) return

  if (!emailRegex.test(emailValue)) {
    signupError.value = '올바른 이메일을 입력해주세요'
    return
  }

  signupStatus.value = 'submitting'

  // 중복 체크
  try {
    const { data: existing } = await supabase
      .from('signups')
      .select('email')
      .eq('email', emailValue)
      .maybeSingle()

    if (existing) {
      signupStatus.value = 'idle'
      signupError.value = '이미 신청하신 이메일입니다 😊'
      return
    }
  } catch {
    // 중복 체크 실패 시 진행 (네트워크 등)
  }

  // Supabase insert
  try {
    const { error } = await supabase
      .from('signups')
      .insert({ email: emailValue, created_at: new Date().toISOString() })

    if (error) {
      // unique 제약 위반 등 중복 에러
      if (error.code === '23505') {
        signupStatus.value = 'idle'
        signupError.value = '이미 신청하신 이메일입니다 😊'
        return
      }
      throw error
    }
  } catch {
    signupStatus.value = 'idle'
    signupError.value = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    return
  }

  email.value = ''
  applicantCount.value++
  signupStatus.value = 'success'
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

async function fetchSignupCount() {
  try {
    const { count, error } = await supabase
      .from('signups')
      .select('*', { count: 'exact', head: true })
    if (!error) applicantCount.value = count ?? 0
  } catch {
    // 에러 시 카운터는 0 유지
  }
}

onMounted(() => {
  fetchSignupCount()
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- 1. 헤더 (고정) -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#" class="text-xl font-bold text-primary">매물쓰</a>
        <button
          @click="scrollToSection('signup')"
          class="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
        >
          무료로 시작하기
        </button>
      </div>
    </header>

    <main class="pt-16">
      <!-- 2. 히어로 섹션 -->
      <section class="relative overflow-hidden bg-gradient-to-b from-blue-50/80 to-white py-20 sm:py-28 lg:py-36">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6 opacity-0 animate-fade-in">
            공인중개사를 위한 매물 설명문 자동완성
          </h1>
          <p class="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in leading-relaxed" style="animation-delay: 200ms">
            복잡한 AI 사용법 몰라도 됩니다.<br class="hidden sm:block" />
            매물 정보만 입력하면 네이버·직방·인스타·문자<br class="hidden sm:block" />
            4개 채널 최적화 설명문이 10초 만에 완성됩니다.
          </p>
          <button
            @click="scrollToSection('signup')"
            class="inline-flex px-8 py-4 bg-primary text-white text-lg font-semibold rounded-xl hover:bg-primary-light transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 opacity-0 animate-fade-in"
            style="animation-delay: 400ms"
          >
            지금 무료로 시작하기
          </button>
        </div>
      </section>

      <!-- 3. 문제 제기 섹션 -->
      <section id="problem" class="py-20 sm:py-28 bg-bg-light scroll-mt-20">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-14">
            하루에 몇 시간을 설명문 쓰는 데 쓰고 계신가요?
          </h2>
          <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all duration-300">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <span class="text-2xl">🕐</span>
              </div>
              <h3 class="font-semibold text-slate-900 mb-3">매물마다 플랫폼별로 따로 작성</h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                네이버, 직방, 인스타, 문자…<br />
                같은 매물인데 매번 다시 써야 해서<br />
                하루 2~3시간이 글쓰기에만 사라집니다
              </p>
            </div>
            <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all duration-300">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <span class="text-2xl">🤖</span>
              </div>
              <h3 class="font-semibold text-slate-900 mb-3">ChatGPT? 프롬프트 짜는 것도 일</h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                AI 써보려 해도 부동산 용어를 모르고,<br />
                매번 길게 설명해야 하고,<br />
                채널별로 다시 요청해야 해서 결국 포기
              </p>
            </div>
            <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all duration-300">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <span class="text-2xl">📈</span>
              </div>
              <h3 class="font-semibold text-slate-900 mb-3">설명문이 곧 매물 경쟁력</h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                잘 쓴 설명문은 문의 전화가 다릅니다.<br />
                근데 매일 수십 개 매물을 잘 쓸 시간이 없죠
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. 기능 소개 섹션 -->
      <section id="features" class="py-20 sm:py-28 bg-white scroll-mt-20">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-14">
            매물쓰는 이렇게 다릅니다
          </h2>
          <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 lg:gap-8">
            <div class="flex flex-col md:flex-row items-center gap-6 md:gap-4 lg:gap-8">
              <div class="text-center">
                <div class="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 class="font-semibold text-slate-900 mb-1">매물 정보 입력</h3>
                <p class="text-slate-600 text-sm leading-relaxed">
                  유형·면적·가격·특징만 입력<br />
                  복잡한 프롬프트 필요 없음
                </p>
              </div>
              <div class="text-primary text-2xl md:rotate-0">
                <span class="md:hidden">↓</span>
                <span class="hidden md:inline">→</span>
              </div>
            </div>
            <div class="flex flex-col md:flex-row items-center gap-6 md:gap-4 lg:gap-8">
              <div class="text-center">
                <div class="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 class="font-semibold text-slate-900 mb-1">부동산 특화 AI 분석</h3>
                <p class="text-slate-600 text-sm leading-relaxed">
                  한국 부동산 업계 언어로 학습된 AI가<br />
                  역세권·학세권·판상형 등 전문 용어를 정확히 반영
                </p>
              </div>
              <div class="text-primary text-2xl md:rotate-0">
                <span class="md:hidden">↓</span>
                <span class="hidden md:inline">→</span>
              </div>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 class="font-semibold text-slate-900 mb-1">4개 채널 동시 완성</h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                네이버(300자)·직방(150자)·<br />
                인스타·문자 글자수까지 자동 최적화
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. 미리보기 섹션 -->
      <section id="preview" class="py-20 sm:py-28 bg-bg-light scroll-mt-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
            직접 확인해보세요
          </h2>
          <p class="text-slate-600 text-center mb-12">같은 매물, 채널마다 최적화된 설명문</p>
          <div class="grid lg:grid-cols-2 gap-8 lg:gap-10">
            <!-- 좌측: 입력 폼 -->
            <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h3 class="font-bold text-slate-900 text-lg mb-6">매물 정보 입력</h3>
              <form @submit.prevent="handleGenerate" class="space-y-6">
                <!-- 기본 정보 -->
                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">매물 유형</label>
                    <select v-model="formData.propertyType" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option v-for="opt in propertyTypes" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">거래 유형</label>
                    <select v-model="formData.dealType" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option v-for="opt in dealTypes" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">면적</label>
                  <input v-model="formData.area" type="text" placeholder="예: 84㎡ 또는 25평" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">층수</label>
                  <input v-model="formData.floor" type="text" placeholder="예: 15층 / 전체 20층" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">가격</label>
                  <input v-model="formData.price" type="text" placeholder="예: 7억 또는 보증금 1억/월세 70" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">방향</label>
                  <select v-model="formData.direction" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option v-for="opt in directions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>
                <!-- 강조 포인트 -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">이 매물만의 특징 · 강조 포인트</label>
                  <textarea v-model="formData.highlights" rows="4" :placeholder="highlightsPlaceholder" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"></textarea>
                  <p class="mt-2 text-xs text-slate-500">✓ 교통  ✓ 주변환경  ✓ 투자가치  ✓ 특이사항<br />무엇이든 적으면 AI가 채널에 맞게 다듬어 드립니다</p>
                </div>
                <!-- 연락처 (선택) -->
                <div class="space-y-4 pt-2 border-t border-slate-100">
                  <label class="block text-sm font-medium text-slate-700">연락처 정보 (선택사항)</label>
                  <input v-model="formData.phone" type="text" placeholder="예: 02-0000-0000" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                  <input v-model="formData.licenseNumber" type="text" placeholder="예: 12345678-공인00000" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <!-- 생성 버튼 -->
                <button
                  type="submit"
                  :disabled="isGenerating"
                  class="w-full py-4 bg-primary text-white text-lg font-semibold rounded-xl hover:bg-primary-light transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {{ isGenerating ? '✨ 생성 중...' : '✨ 설명문 생성하기' }}
                </button>
              </form>
            </div>
            <!-- 우측: 출력 결과 -->
            <div class="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div class="flex border-b border-slate-200 overflow-x-auto shrink-0">
                <button
                  v-for="tab in previewTabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="[
                    'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary bg-white'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  ]"
                >
                  {{ tab.label }}
                </button>
              </div>
              <div class="flex-1 min-h-[320px] bg-white rounded-b-xl mt-0 p-5 relative flex flex-col">
                <button
                  @click="copyToClipboard(activeTab)"
                  class="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors z-10"
                >
                  {{ copySuccessTab === activeTab ? '복사됨 ✓' : '복사하기' }}
                </button>
                <pre class="text-sm text-slate-700 whitespace-pre-wrap font-sans pr-24 pt-1 flex-1 overflow-y-auto">{{ currentPreviewContent()[activeTab] }}</pre>
                <p class="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 shrink-0">{{ getCharCount(activeTab) }}자</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. 요금제 섹션 -->
      <section id="pricing" class="py-20 sm:py-28 bg-white scroll-mt-20">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">
            한 달에 커피 10잔 값으로
          </h2>
          <p class="text-slate-600 text-center mb-14">하루 2~3시간 아끼는 툴입니다</p>
          <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
            <!-- 무료 -->
            <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 class="font-bold text-slate-900 text-lg mb-1">무료</h3>
              <p class="text-slate-500 text-sm mb-4">맛보기</p>
              <ul class="space-y-3 text-slate-600 text-sm mb-6">
                <li>✓ 하루 3회 생성</li>
                <li>✓ 4개 채널 동시 생성</li>
              </ul>
              <div class="text-2xl font-bold text-slate-900 mb-6">0원</div>
              <button
                @click="scrollToSection('signup')"
                class="w-full py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                무료로 시작
              </button>
            </div>
            <!-- 베이직 (추천) -->
            <div class="bg-white rounded-2xl p-8 border-2 border-primary shadow-lg relative">
              <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                가장 인기
              </span>
              <h3 class="font-bold text-slate-900 text-lg mb-1">베이직</h3>
              <p class="text-slate-500 text-sm mb-4">매일 쓰는 중개사용</p>
              <ul class="space-y-3 text-slate-600 text-sm mb-6">
                <li>✓ 무제한 생성</li>
                <li>✓ 생성 이력 30일 저장</li>
                <li>✓ 우선 고객지원</li>
              </ul>
              <div class="text-2xl font-bold text-primary mb-6">월 9,800원</div>
              <button
                @click="scrollToSection('signup')"
                class="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-all hover:shadow-lg"
              >
                시작하기
              </button>
            </div>
            <!-- 프로 -->
            <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 class="font-bold text-slate-900 text-lg mb-1">프로</h3>
              <p class="text-slate-500 text-sm mb-4">팀·법인 중개사무소용</p>
              <ul class="space-y-3 text-slate-600 text-sm mb-6">
                <li>✓ 베이직 전체 포함</li>
                <li>✓ 나만의 템플릿 저장</li>
                <li>✓ 팀 계정 2개</li>
                <li>✓ 스타일 학습 기능</li>
              </ul>
              <div class="text-2xl font-bold text-slate-900 mb-6">월 19,800원</div>
              <button
                @click="scrollToSection('signup')"
                class="w-full py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. 사전신청 섹션 -->
      <section id="signup" class="py-20 sm:py-28 bg-gradient-to-b from-primary/5 to-bg-light scroll-mt-20">
        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            베타 테스터 30명을 모집합니다
          </h2>
          <p class="text-slate-600 mb-10 leading-relaxed">
            출시 전 무료로 먼저 사용하고<br />
            평생 30% 할인 혜택을 드립니다
          </p>
          <form @submit.prevent="handleSignup" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              v-model="email"
              type="email"
              placeholder="이메일을 입력해주세요"
              :disabled="signupStatus === 'submitting' || signupStatus === 'success'"
              @input="signupError = ''"
              :class="[
                'flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed',
                signupError ? 'border-red-400' : 'border-slate-300'
              ]"
            />
            <button
              type="submit"
              :disabled="signupStatus === 'submitting' || signupStatus === 'success'"
              class="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-light transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-primary shrink-0"
            >
              {{ signupStatus === 'submitting' ? '신청 중...' : signupStatus === 'success' ? '신청 완료! 🎉' : '사전신청하기' }}
            </button>
          </form>
          <p v-if="signupError" class="mt-3 text-red-500 text-sm">
            {{ signupError }}
          </p>
          <p v-else-if="signupStatus === 'success'" class="mt-3 text-green-600 text-sm font-medium">
            ✓ 신청이 완료되었습니다! 베타 오픈 시 가장 먼저 알려드릴게요 😊
          </p>
          <p class="mt-6 text-slate-500 text-sm">
            현재 {{ applicantCount }}명 신청 완료
          </p>
          <p class="mt-4 text-slate-500 text-sm">
            ✓ 신용카드 불필요 &nbsp; ✓ 언제든 취소 가능 &nbsp; ✓ 베타 기간 완전 무료
          </p>
        </div>
      </section>

      <!-- 8. 푸터 -->
      <footer class="py-8 bg-slate-900 text-slate-400">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm">매물쓰 © 2025</p>
          <div class="flex gap-4 text-sm">
            <a href="#" class="hover:text-white transition-colors">이용약관</a>
            <span class="text-slate-500">·</span>
            <a href="#" class="hover:text-white transition-colors">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>
