package com.gestorpro.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // AUTO-SLEEP: Nenhuma flag de tela forçada.
        // O sistema respeita as configurações de sleep do celular do usuário.
    }
}
