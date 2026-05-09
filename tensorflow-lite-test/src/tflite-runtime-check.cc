#include <cmath>
#include <cstdint>
#include <cerrno>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <sys/stat.h>

#include "flatbuffers/flatbuffers.h"
#include "tensorflow/lite/c/c_api.h"
#include "tensorflow/lite/schema/schema_generated.h"

namespace {

std::vector<uint8_t> BuildAddModel() {
  flatbuffers::FlatBufferBuilder builder(1024);

  const auto shape = builder.CreateVector<int32_t>({1});
  const auto lhs_name = builder.CreateString("lhs");
  const auto rhs_name = builder.CreateString("rhs");
  const auto sum_name = builder.CreateString("sum");

  std::vector<flatbuffers::Offset<tflite::Tensor>> tensors;
  tensors.push_back(tflite::CreateTensor(
      builder, shape, tflite::TensorType_FLOAT32, 0, lhs_name));
  tensors.push_back(tflite::CreateTensor(
      builder, shape, tflite::TensorType_FLOAT32, 0, rhs_name));
  tensors.push_back(tflite::CreateTensor(
      builder, shape, tflite::TensorType_FLOAT32, 0, sum_name));

  const auto op_code = tflite::CreateOperatorCode(
      builder, 0, 0, 1, tflite::BuiltinOperator_ADD);

  const auto inputs = builder.CreateVector<int32_t>({0, 1});
  const auto outputs = builder.CreateVector<int32_t>({2});
  const auto add_options = tflite::CreateAddOptions(
      builder, tflite::ActivationFunctionType_NONE);
  const auto op = tflite::CreateOperator(
      builder, 0, inputs, outputs, tflite::BuiltinOptions_AddOptions,
      add_options.Union());

  const auto subgraph = tflite::CreateSubGraph(
      builder, builder.CreateVector(tensors), builder.CreateVector<int32_t>({0, 1}),
      builder.CreateVector<int32_t>({2}),
      builder.CreateVector<flatbuffers::Offset<tflite::Operator>>({op}),
      builder.CreateString("main"));

  const auto empty_buffer = tflite::CreateBuffer(builder);
  const auto model = tflite::CreateModel(
      builder, 3,
      builder.CreateVector<flatbuffers::Offset<tflite::OperatorCode>>({op_code}),
      builder.CreateVector<flatbuffers::Offset<tflite::SubGraph>>({subgraph}),
      builder.CreateString("minimal add model for runtime validation"),
      builder.CreateVector<flatbuffers::Offset<tflite::Buffer>>({empty_buffer}));

  tflite::FinishModelBuffer(builder, model);

  const auto* begin = builder.GetBufferPointer();
  return std::vector<uint8_t>(begin, begin + builder.GetSize());
}

bool WriteFile(const std::string& path, const std::vector<uint8_t>& data) {
  std::ofstream out(path, std::ios::binary);
  if (!out) {
    return false;
  }
  out.write(reinterpret_cast<const char*>(data.data()), data.size());
  return out.good();
}

int CheckRuntime(const char* model_path) {
  TfLiteModel* model = TfLiteModelCreateFromFile(model_path);
  if (model == nullptr) {
    std::cerr << "failed to load model: " << model_path << "\n";
    return 1;
  }

  TfLiteInterpreterOptions* options = TfLiteInterpreterOptionsCreate();
  TfLiteInterpreterOptionsSetNumThreads(options, 1);

  TfLiteInterpreter* interpreter = TfLiteInterpreterCreate(model, options);
  if (interpreter == nullptr) {
    std::cerr << "failed to create interpreter\n";
    TfLiteInterpreterOptionsDelete(options);
    TfLiteModelDelete(model);
    return 1;
  }

  if (TfLiteInterpreterAllocateTensors(interpreter) != kTfLiteOk) {
    std::cerr << "failed to allocate tensors\n";
    TfLiteInterpreterDelete(interpreter);
    TfLiteInterpreterOptionsDelete(options);
    TfLiteModelDelete(model);
    return 1;
  }

  float lhs = 2.0f;
  float rhs = 3.5f;
  if (TfLiteTensorCopyFromBuffer(TfLiteInterpreterGetInputTensor(interpreter, 0),
                                 &lhs, sizeof(lhs)) != kTfLiteOk ||
      TfLiteTensorCopyFromBuffer(TfLiteInterpreterGetInputTensor(interpreter, 1),
                                 &rhs, sizeof(rhs)) != kTfLiteOk) {
    std::cerr << "failed to copy input tensors\n";
    TfLiteInterpreterDelete(interpreter);
    TfLiteInterpreterOptionsDelete(options);
    TfLiteModelDelete(model);
    return 1;
  }

  if (TfLiteInterpreterInvoke(interpreter) != kTfLiteOk) {
    std::cerr << "failed to invoke interpreter\n";
    TfLiteInterpreterDelete(interpreter);
    TfLiteInterpreterOptionsDelete(options);
    TfLiteModelDelete(model);
    return 1;
  }

  float output = 0.0f;
  if (TfLiteTensorCopyToBuffer(TfLiteInterpreterGetOutputTensor(interpreter, 0),
                               &output, sizeof(output)) != kTfLiteOk) {
    std::cerr << "failed to copy output tensor\n";
    TfLiteInterpreterDelete(interpreter);
    TfLiteInterpreterOptionsDelete(options);
    TfLiteModelDelete(model);
    return 1;
  }

  TfLiteInterpreterDelete(interpreter);
  TfLiteInterpreterOptionsDelete(options);
  TfLiteModelDelete(model);

  const float expected = lhs + rhs;
  if (std::fabs(output - expected) > 0.0001f) {
    std::cerr << "unexpected output: got " << output << ", expected "
              << expected << "\n";
    return 1;
  }

  std::cout << "TensorFlow Lite runtime OK: " << lhs << " + " << rhs
            << " = " << output << "\n";
  std::cout << "TfLiteVersion: " << TfLiteVersion() << "\n";
  return 0;
}

}  // namespace

int main(int argc, char** argv) {
  const std::string model_path =
      argc > 1 ? argv[1] : "/tmp/tflite-runtime-check/add.tflite";

  if (argc == 1) {
    if (mkdir("/tmp/tflite-runtime-check", 0755) != 0 && errno != EEXIST) {
      std::cerr << "failed to create /tmp/tflite-runtime-check\n";
      return 1;
    }
    if (!WriteFile(model_path, BuildAddModel())) {
      std::cerr << "failed to write generated model: " << model_path << "\n";
      return 1;
    }
  }

  return CheckRuntime(model_path.c_str());
}
