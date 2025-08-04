# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
# For more details, see https://developer.android.com/studio/build/shrink-code

# ----------------------------------
# AndroidX and Support Library rules
# ----------------------------------
-keep class androidx.lifecycle.ViewModel { *; }
-keep class androidx.lifecycle.LiveData { *; }
-keep class androidx.lifecycle.MutableLiveData { *; }
-keep class androidx.lifecycle.LifecycleObserver { *; }
-keep class androidx.lifecycle.Lifecycle { *; }
-keep class * implements androidx.lifecycle.LifecycleObserver { *; }
-keep class * extends androidx.fragment.app.Fragment { *; }
-keep class * extends androidx.fragment.app.DialogFragment { *; }
-keep public class * extends android.view.View { *; }
-keep public class * extends android.app.Activity { *; }
-keep public class * extends android.app.Application { *; }
-keep public class * extends android.app.Service { *; }
-keep public class * extends android.content.BroadcastReceiver { *; }
-keep public class * extends android.content.ContentProvider { *; }
-keep public class * extends android.app.backup.BackupAgentHelper { *; }
-keep public class * extends android.preference.Preference { *; }
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public enum com.bumptech.glide.load.resource.bitmap.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

# ----------------------------------
# Capacitor rules
# ----------------------------------
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-keep class com.getcapacitor.cordova.** { *; }
-keep class org.apache.cordova.** { *; }
-keep class org.xwalk.core.** { *; }

# Keep JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep the R class
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Keep the classes that implement Parcelable
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Keep the Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep callback classes
-keep class * implements com.getcapacitor.Plugin {
    *;
}

# Keep Capacitor classes
-keep class org.apache.cordova.** { *; }
-keep class org.apache.cordova.engine.** { *; }
-keep class org.apache.cordova.engine.SystemWebViewClient { *; }
-keep class org.apache.cordova.engine.SystemWebChromeClient { *; }
-keep class org.apache.cordova.engine.SystemWebView { *; }
-keep class org.apache.cordova.engine.SystemWebViewEngine { *; }
-keep class org.apache.cordova.engine.SystemExposedJsApi { *; }

# Keep Capacitor Bridge
-keep class com.getcapacitor.Bridge { *; }
-keep class com.getcapacitor.BridgeActivity { *; }
-keep class com.getcapacitor.BridgeFragment { *; }
-keep class com.getcapacitor.BridgeWebViewClient { *; }
-keep class com.getcapacitor.CapConfig { *; }
-keep class com.getcapacitor.PluginCall { *; }
-keep class com.getcapacitor.PluginMethod { *; }
-keep class com.getcapacitor.PluginResult { *; }

# Keep plugin classes
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.PluginCall { *; }
-keep class * extends com.getcapacitor.PluginMethod { *; }
-keep class * extends com.getcapacitor.PluginResult { *; }

# Keep annotations
-keepattributes *Annotation*
-keepattributes InnerClasses
-keepattributes Signature
-keepattributes EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterNames, RuntimeVisibleParameterAnnotations, AnnotationDefault

# Keep Kotlin metadata
-keepclassmembers class **.R$* {
    public static <fields>;
}
-keep class kotlin.Metadata { *; }
-keep class kotlin.reflect.jvm.internal.impl.** { *; }
-keep class org.jetbrains.annotations.** { *; }
-keep class org.intellij.lang.annotations.** { *; }
-keep class org.jetbrains.kotlin.** { *; }

# Keep Glide
-keep public class * implements com.bumptech.glide.module.AppGlideModule
-keep class com.bumptech.glide.integration.webp.** { *; }
-keep class com.bumptech.glide.load.data.ParcelFileDescriptorRewinder { *; }
-keep class com.bumptech.glide.load.resource.bitmap.VideoDecoder { *; }
-keep class com.bumptech.glide.load.resource.bitmap.VideoDecoder$ParcelFileDescriptorInitializer { *; }
-keep class com.bumptech.glide.load.resource.bitmap.VideoDecoder$AssetFileDescriptorInitializer { *; }
-keep class com.bumptech.glide.load.resource.bitmap.VideoDecoder$ByteBufferInitializer { *; }
-keep class com.bumptech.glide.load.resource.bitmap.VideoDecoder$InputStreamInitializer { *; }
-keep class com.bumptech.glide.load.resource.bitmap.VideoDecoder$VideoDecoderException { *; }
