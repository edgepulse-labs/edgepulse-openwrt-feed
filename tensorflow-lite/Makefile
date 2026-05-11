include $(TOPDIR)/rules.mk

PKG_NAME:=tensorflow-lite
PKG_VERSION:=2.14.1
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/tensorflow/tensorflow/tar.gz/v$(PKG_VERSION)?
PKG_HASH:=6b31ed347ed7a03c45b906aa41628ac91c3db7c84cb816971400d470e58ba494
PKG_BUILD_DIR:=$(BUILD_DIR)/tensorflow-$(PKG_VERSION)

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1
CMAKE_SOURCE_SUBDIR:=tensorflow/lite
PKG_BUILD_PARALLEL:=1
PKG_BUILD_DEPENDS:=abseil-cpp cpuinfo eigen farmhash fft2d flatbuffers gemmlowp ml-dtypes neon-2-sse pthreadpool ruy

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/tensorflow-lite
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=TensorFlow Lite inference library
  URL:=https://www.tensorflow.org/lite
  DEPENDS:=+farmhash +libpthread +libstdcpp
endef

define Package/tensorflow-lite/description
 TensorFlow Lite dynamic library and headers for running trained machine
 learning models on-device.
endef

CMAKE_OPTIONS += \
	-Dabsl_DIR=$(STAGING_DIR)/usr/lib/cmake/absl \
	-DBUILD_SHARED_LIBS=ON \
	-DCMAKE_CXX_FLAGS="$(TARGET_CXXFLAGS) -I$(STAGING_DIR)/usr/include/gemmlowp" \
	-DCMAKE_FIND_PACKAGE_PREFER_CONFIG=ON \
	-DCMAKE_POSITION_INDEPENDENT_CODE=ON \
	-DEigen3_DIR=$(STAGING_DIR)/usr/share/eigen3/cmake \
	-DFETCHCONTENT_FULLY_DISCONNECTED=ON \
	-DFETCHCONTENT_QUIET=OFF \
	-DFETCHCONTENT_SOURCE_DIR_FFT2D=$(STAGING_DIR)/usr/include/fft2d \
	-DFETCHCONTENT_SOURCE_DIR_ML_DTYPES=$(STAGING_DIR)/usr/src/ml_dtypes \
	-DFFT2D_SOURCE_DIR=$(STAGING_DIR)/usr/include/fft2d \
	-DFlatBuffers_DIR=$(STAGING_DIR)/usr/lib/cmake/flatbuffers \
	-DML_DTYPES_SOURCE_DIR=$(STAGING_DIR)/usr/src/ml_dtypes \
	-DNEON_2_SSE_DIR=$(STAGING_DIR)/usr/lib/cmake/NEON_2_SSE \
	-DSYSTEM_PTHREADPOOL=ON \
	-DSYSTEM_FARMHASH=ON \
	-DTFLITE_ENABLE_EXTERNAL_DELEGATE=ON \
	-DTFLITE_ENABLE_GPU=OFF \
	-DTFLITE_ENABLE_INSTALL=ON \
	-DTFLITE_ENABLE_MMAP=ON \
	-DTFLITE_ENABLE_NNAPI=OFF \
	-DTFLITE_ENABLE_RUY=ON \
	-DTFLITE_ENABLE_XNNPACK=OFF

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
	$(CP) $(PKG_BUILD_DIR)/libtensorflow-lite.so $(1)/usr/lib/
endef

define Package/tensorflow-lite/install
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_BUILD_DIR)/libtensorflow-lite.so $(1)/usr/lib/
	$(CP) $(PKG_INSTALL_DIR)/usr/lib/libfft2d_fftsg*.so* $(1)/usr/lib/
endef

$(eval $(call BuildPackage,tensorflow-lite))
