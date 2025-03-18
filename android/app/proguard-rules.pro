# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Kakao SDK 관련 규칙 유지
-keep class com.kakao.** { *; }
-keep class com.kakao.sdk.** { *; }
-keep class com.kakao.auth.** { *; }
-keep class com.kakao.util.** { *; }
-keep class com.kakao.network.** { *; }
-dontwarn com.kakao.**

# Parcelable 객체 유지
-keepclassmembers class * implements android.os.Parcelable {
    static final android.os.Parcelable$Creator *;
}

# Retrofit, OkHttp, Gson (REST API 관련)
-keep class com.google.gson.** { *; }
-keep class retrofit2.** { *; }
-keep class okhttp3.** { *; }

-keep class com.google.android.gms.** { *; }
-keep class com.google.api.client.** { *; }

# R8 최적화 충돌 방지
-keepattributes *Annotation*
-dontwarn org.bouncycastle.jsse.**
-dontwarn org.conscrypt.*
-dontwarn org.openjsse.**

-keep class com.spiritfront.** { *; }
-keep class * extends android.app.Application { *; }
-keep class * extends android.content.BroadcastReceiver { *; }
-keep class * extends android.content.ContentProvider { *; }
-keep class * extends android.content.Service { *; }
-keep class * extends android.view.View { *; }
-keepclassmembers class * { @android.webkit.JavascriptInterface <methods>; }
-keepattributes *Annotation*
-keep public class * {
    public protected *;
}
-dontwarn com.spiritfront.**

