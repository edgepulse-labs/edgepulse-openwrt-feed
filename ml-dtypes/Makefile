include $(TOPDIR)/rules.mk

PKG_NAME:=ml-dtypes
PKG_VERSION:=5b9fc9ad978757654843f4a8d899715dbea30e88
PKG_RELEASE:=1

PKG_SOURCE:=ml_dtypes-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/jax-ml/ml_dtypes/tar.gz/$(PKG_VERSION)?
PKG_HASH:=9662811d9ab3823a56f8fa91b5a67fd82062b6dd4f187169b41e82a44e526455
PKG_BUILD_DIR:=$(BUILD_DIR)/ml_dtypes-$(PKG_VERSION)

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE

include $(INCLUDE_DIR)/package.mk

define Package/ml-dtypes
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Machine learning data type headers
  URL:=https://github.com/jax-ml/ml_dtypes
endef

define Package/ml-dtypes/description
 Header-only machine learning data types used by TensorFlow Lite.
endef

define Build/Compile
endef

define Build/InstallDev
	$(INSTALL_DIR) $(1)/usr/src/ml_dtypes
	$(CP) $(PKG_BUILD_DIR)/ml_dtypes $(1)/usr/src/ml_dtypes/
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/LICENSE $(1)/usr/src/ml_dtypes/
endef

define Package/ml-dtypes/install
	true
endef

$(eval $(call BuildPackage,ml-dtypes))
