include $(TOPDIR)/rules.mk

PKG_NAME:=litert
PKG_VERSION:=2.1.4
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/google-ai-edge/LiteRT/tar.gz/refs/tags/v$(PKG_VERSION)?
PKG_HASH:=be614b050cc6603863acca0c48d0e210c0399ca80974648cb6fb5f70374a5b86
PKG_BUILD_DIR:=$(BUILD_DIR)/LiteRT-$(PKG_VERSION)

PROTOBUF_COMMIT:=90b73ac3f0b10320315c2ca0d03a5a9b095d2f66
PROTOBUF_SOURCE:=protobuf-$(PROTOBUF_COMMIT).tar.gz
PROTOBUF_HASH:=f5ba48be0fd7a32daa6900b9bbf90b1cb0af9fc696ee7d71455149898f46ee46

TENSORFLOW_VERSION:=2.21.0-rc0
TENSORFLOW_SOURCE:=tensorflow-$(TENSORFLOW_VERSION).tar.gz
TENSORFLOW_HASH:=91b2c2d12f0ebd78d84e5e1401269d0e6e36db5b74e19cc929e0f012b380af39

FLATBUFFERS_VERSION:=25.9.23
FLATBUFFERS_SOURCE:=flatbuffers-$(FLATBUFFERS_VERSION).tar.gz
FLATBUFFERS_HASH:=9102253214dea6ae10c2ac966ea1ed2155d22202390b532d1dea64935c518ada

OPENCL_HEADERS_COMMIT:=dcd5bede6859d26833cd85f0d6bbcee7382dc9b3
OPENCL_HEADERS_SOURCE:=opencl-headers-$(OPENCL_HEADERS_COMMIT).tar.gz
OPENCL_HEADERS_HASH:=ca8090359654e94f2c41e946b7e9d826253d795ae809ce7c83a7d3c859624693

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE

CMAKE_SOURCE_SUBDIR:=litert
PKG_BUILD_PARALLEL:=1
PKG_BUILD_DEPENDS:=abseil-cpp cpuinfo eigen farmhash fft2d flatbuffers/host flatbuffers gemmlowp ml-dtypes ruy

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Download/protobuf
  FILE:=$(PROTOBUF_SOURCE)
  URL:=https://codeload.github.com/protocolbuffers/protobuf/tar.gz/$(PROTOBUF_COMMIT)?
  HASH:=$(PROTOBUF_HASH)
endef
$(eval $(call Download,protobuf))

define Download/tensorflow
  FILE:=$(TENSORFLOW_SOURCE)
  URL:=https://codeload.github.com/tensorflow/tensorflow/tar.gz/refs/tags/v$(TENSORFLOW_VERSION)?
  HASH:=$(TENSORFLOW_HASH)
endef
$(eval $(call Download,tensorflow))

define Download/flatbuffers
  FILE:=$(FLATBUFFERS_SOURCE)
  URL:=https://codeload.github.com/google/flatbuffers/tar.gz/refs/tags/v$(FLATBUFFERS_VERSION)?
  HASH:=$(FLATBUFFERS_HASH)
endef
$(eval $(call Download,flatbuffers))

define Download/opencl-headers
  FILE:=$(OPENCL_HEADERS_SOURCE)
  URL:=https://codeload.github.com/KhronosGroup/OpenCL-Headers/tar.gz/$(OPENCL_HEADERS_COMMIT)?
  HASH:=$(OPENCL_HEADERS_HASH)
endef
$(eval $(call Download,opencl-headers))

define Package/litert
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=LiteRT inference runtime library
  URL:=https://ai.google.dev/edge/litert
  DEPENDS:=+farmhash +libpthread +libstdcpp
endef

define Package/litert/description
 LiteRT shared runtime library for MVP validation on OpenWrt. This package
 builds the CPU runtime path and exports the bundled TensorFlow Lite C API.
endef

define Build/Prepare
	$(call Build/Prepare/Default)
	mkdir -p $(PKG_BUILD_DIR)/protobuf
	$(HOST_TAR) -C $(PKG_BUILD_DIR)/protobuf --strip-components=1 -xzf $(DL_DIR)/$(PROTOBUF_SOURCE)
	mkdir -p $(PKG_BUILD_DIR)/tensorflow-source
	$(HOST_TAR) -C $(PKG_BUILD_DIR)/tensorflow-source --strip-components=1 -xzf $(DL_DIR)/$(TENSORFLOW_SOURCE)
	mkdir -p $(PKG_BUILD_DIR)/flatbuffers
	$(HOST_TAR) -C $(PKG_BUILD_DIR)/flatbuffers --strip-components=1 -xzf $(DL_DIR)/$(FLATBUFFERS_SOURCE)
	mkdir -p $(PKG_BUILD_DIR)/opencl_headers
	$(HOST_TAR) -C $(PKG_BUILD_DIR)/opencl_headers --strip-components=1 -xzf $(DL_DIR)/$(OPENCL_HEADERS_SOURCE)
	mkdir -p $(PKG_BUILD_DIR)/flatbuffers-host
	(cd $(PKG_BUILD_DIR)/flatbuffers-host; $(STAGING_DIR_HOST)/bin/cmake -G Ninja -DCMAKE_BUILD_TYPE=Release -DFLATBUFFERS_BUILD_FLATC=ON -DFLATBUFFERS_BUILD_FLATHASH=OFF -DFLATBUFFERS_BUILD_TESTS=OFF -DFLATBUFFERS_INSTALL=OFF ../flatbuffers)
	$(NINJA) -C $(PKG_BUILD_DIR)/flatbuffers-host flatc
endef

CMAKE_OPTIONS += \
	-Dabsl_DIR=$(STAGING_DIR)/usr/lib/cmake/absl \
	-DBUILD_SHARED_LIBS=OFF \
	-DCMAKE_CXX_FLAGS="$(TARGET_CXXFLAGS) -DFLATBUFFERS_LOCALE_INDEPENDENT=0 -DTFLITE_WITHOUT_XNNPACK -I$(PKG_BUILD_DIR)/flatbuffers/include -I$(STAGING_DIR)/usr/include/gemmlowp" \
	-DCMAKE_FIND_PACKAGE_PREFER_CONFIG=ON \
	-DCMAKE_POSITION_INDEPENDENT_CODE=ON \
	-DEigen3_DIR=$(STAGING_DIR)/usr/share/eigen3/cmake \
	-DFETCHCONTENT_FULLY_DISCONNECTED=ON \
	-DFETCHCONTENT_QUIET=OFF \
	-DFETCHCONTENT_SOURCE_DIR_FFT2D=$(STAGING_DIR)/usr/include/fft2d \
	-DFETCHCONTENT_SOURCE_DIR_FLATBUFFERS=$(PKG_BUILD_DIR)/flatbuffers \
	-DFETCHCONTENT_SOURCE_DIR_ML_DTYPES=$(STAGING_DIR)/usr/src/ml_dtypes \
	-DFFT2D_SOURCE_DIR=$(STAGING_DIR)/usr/include/fft2d \
	-DLITERT_AUTO_BUILD_TFLITE=ON \
	-DLITERT_BUILD_TOOLS=OFF \
	-DLITERT_BUILD_VENDOR_PLUGINS=OFF \
	-DLITERT_DISABLE_KLEIDIAI=ON \
	-DLITERT_ENABLE_GPU=OFF \
	-DLITERT_ENABLE_NPU=OFF \
	-DLITERT_HOST_C_COMPILER=$(HOSTCC) \
	-DLITERT_HOST_CXX_COMPILER=$(HOSTCXX) \
	-DML_DTYPES_SOURCE_DIR=$(STAGING_DIR)/usr/src/ml_dtypes \
	-DSYSTEM_FARMHASH=ON \
	-DSYSTEM_PTHREADPOOL=ON \
	-DTENSORFLOW_SOURCE_DIR=$(PKG_BUILD_DIR)/tensorflow-source \
	-DTFLITE_ENABLE_BENCHMARK_MODEL=OFF \
	-DTFLITE_ENABLE_EXTERNAL_DELEGATE=OFF \
	-DTFLITE_ENABLE_EXTRA_TOOLS=OFF \
	-DTFLITE_ENABLE_GPU=OFF \
	-DTFLITE_ENABLE_INSTALL=OFF \
	-DTFLITE_ENABLE_LABEL_IMAGE=OFF \
	-DTFLITE_ENABLE_MMAP=ON \
	-DTFLITE_ENABLE_NNAPI=OFF \
	-DTFLITE_ENABLE_RUY=ON \
	-DTFLITE_ENABLE_XNNPACK=OFF \
	-DTFLITE_HOST_TOOLS_DIR=$(PKG_BUILD_DIR)/flatbuffers-host

define Build/Compile
	$(call Build/Compile/CMake,litert_runtime_c_api_shared_lib)
endef

define Build/InstallDev
	$(INSTALL_DIR) $(1)/usr/include/litert
	$(CP) $(PKG_BUILD_DIR)/litert/c/*.h $(1)/usr/include/litert/
	$(CP) $(PKG_BUILD_DIR)/litert/c/options $(1)/usr/include/litert/
	$(INSTALL_DIR) $(1)/usr/include/tensorflow/lite
	$(CP) $(PKG_BUILD_DIR)/tflite/c $(1)/usr/include/tensorflow/lite/
	$(CP) $(PKG_BUILD_DIR)/tflite/core $(1)/usr/include/tensorflow/lite/
	$(CP) $(PKG_BUILD_DIR)/tflite/schema $(1)/usr/include/tensorflow/lite/
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_BUILD_DIR)/c/libLiteRt.so $(1)/usr/lib/
endef

define Package/litert/install
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_BUILD_DIR)/c/libLiteRt.so $(1)/usr/lib/
endef

$(eval $(call BuildPackage,litert))
